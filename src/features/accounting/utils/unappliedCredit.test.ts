import { describe, expect, it } from "vitest";
import {
  hasAvailableCredit,
  hasUnappliedCredit,
  isCancellablePayment,
  isCreditApplicationNote,
  isReversibleMovement,
  isStandaloneAccount,
  paymentSplit,
  planCreditApplication,
  splitPaymentApplication,
  summarizeCancelImpact,
  totalUnapplied,
} from "./unappliedCredit";
import type {
  PaymentApplication,
  PaymentResponse,
} from "../types/payment.types";
import type {
  AccountsPayableMovementResponse,
  AccountsPayableResponse,
} from "@/features/live-chicken/accounting/accounts-payable/types";

const payment = (
  overrides: Partial<PaymentResponse> = {},
): PaymentResponse => ({
  id: 1,
  amount: 1000,
  paymentDate: "2026-09-01",
  paymentMethod: "DEPOSIT",
  status: "ACTIVE",
  createdAt: "2026-09-01T10:00:00",
  ...overrides,
});

describe("splitPaymentApplication", () => {
  it("aplica todo cuando el monto no supera el saldo", () => {
    expect(splitPaymentApplication(600, 1000)).toEqual({
      applied: 600,
      parked: 0,
    });
  });

  it("cubre el saldo y estaciona el excedente como saldo a favor", () => {
    expect(splitPaymentApplication(1000, 600)).toEqual({
      applied: 600,
      parked: 400,
    });
  });

  it("estaciona todo cuando la cuenta ya no tiene saldo", () => {
    expect(splitPaymentApplication(500, 0)).toEqual({
      applied: 0,
      parked: 500,
    });
  });
});

describe("hasUnappliedCredit", () => {
  it("detecta saldo a favor en pagos activos", () => {
    expect(hasUnappliedCredit(payment({ remainingAmount: 400 }))).toBe(true);
  });

  it("ignora pagos totalmente aplicados", () => {
    expect(hasUnappliedCredit(payment({ remainingAmount: 0 }))).toBe(false);
  });

  it("ignora pagos cancelados aunque conserven remanente", () => {
    expect(
      hasUnappliedCredit(
        payment({ status: "CANCELLED", remainingAmount: 400 }),
      ),
    ).toBe(false);
  });
});

describe("totalUnapplied", () => {
  it("suma solo el remanente de pagos activos", () => {
    expect(
      totalUnapplied([
        payment({ id: 1, remainingAmount: 400 }),
        payment({ id: 2, remainingAmount: 0 }),
        payment({
          id: 3,
          status: "CANCELLED",
          remainingAmount: 700,
        }),
      ]),
    ).toBe(400);
  });
});

const standaloneAccount = (
  overrides: Partial<AccountsPayableResponse> = {},
): AccountsPayableResponse =>
  ({
    id: 1,
    sourceType: "OTHER",
    sourceId: undefined,
    sourceBatchId: undefined,
    ...overrides,
  }) as AccountsPayableResponse;

const paymentMovement = (
  overrides: Partial<AccountsPayableMovementResponse> = {},
): AccountsPayableMovementResponse =>
  ({
    id: 10,
    movementType: "PAYMENT",
    paymentId: 5,
    ...overrides,
  }) as AccountsPayableMovementResponse;

describe("isStandaloneAccount", () => {
  it("acepta cuentas manuales sin documento origen", () => {
    expect(isStandaloneAccount(standaloneAccount())).toBe(true);
    expect(
      isStandaloneAccount(standaloneAccount({ sourceType: "ADJUSTMENT" })),
    ).toBe(true);
  });

  it("rechaza cuentas ligadas a remesa o venta", () => {
    expect(
      isStandaloneAccount(standaloneAccount({ sourceType: "BATCH" })),
    ).toBe(false);
    expect(
      isStandaloneAccount(standaloneAccount({ sourceType: "DELIVERY" })),
    ).toBe(false);
    expect(isStandaloneAccount(standaloneAccount({ sourceId: 99 }))).toBe(
      false,
    );
    expect(isStandaloneAccount(standaloneAccount({ sourceBatchId: 99 }))).toBe(
      false,
    );
  });
});

describe("isReversibleMovement", () => {
  it("acepta aplicaciones de pago en cuentas manuales", () => {
    expect(isReversibleMovement(paymentMovement(), standaloneAccount())).toBe(
      true,
    );
  });

  it("rechaza movimientos que no son aplicación de pago", () => {
    expect(
      isReversibleMovement(
        paymentMovement({ movementType: "REVERSAL", paymentId: undefined }),
        standaloneAccount(),
      ),
    ).toBe(false);
    expect(
      isReversibleMovement(
        paymentMovement({ movementType: "COMPENSATION" }),
        standaloneAccount(),
      ),
    ).toBe(false);
  });

  it("rechaza aplicaciones en cuentas ligadas a remesa", () => {
    expect(
      isReversibleMovement(
        paymentMovement(),
        standaloneAccount({ sourceType: "BATCH", sourceId: 7 }),
      ),
    ).toBe(false);
  });
});

describe("paymentSplit", () => {
  it("separa lo aplicado del saldo a favor", () => {
    expect(
      paymentSplit(payment({ amount: 1000, remainingAmount: 300 })),
    ).toEqual({ applied: 700, parked: 300 });
  });

  it("marca todo como aplicado cuando no hay remanente", () => {
    expect(paymentSplit(payment({ amount: 500, remainingAmount: 0 }))).toEqual({
      applied: 500,
      parked: 0,
    });
  });

  it("marca todo como saldo a favor cuando no se aplicó nada", () => {
    expect(
      paymentSplit(payment({ amount: 500, remainingAmount: 500 })),
    ).toEqual({ applied: 0, parked: 500 });
  });
});

describe("isCancellablePayment", () => {
  it("solo permite cancelar pagos activos", () => {
    expect(isCancellablePayment(payment())).toBe(true);
    expect(isCancellablePayment(payment({ status: "CANCELLED" }))).toBe(false);
  });
});

describe("isCreditApplicationNote", () => {
  it("detecta las aplicaciones de saldo a favor", () => {
    expect(
      isCreditApplicationNote("Aplicación de saldo a favor · pago folio DEP-1"),
    ).toBe(true);
    expect(isCreditApplicationNote("Pago folio DEP-1")).toBe(false);
    expect(isCreditApplicationNote(undefined)).toBe(false);
  });
});

const application = (
  overrides: Partial<PaymentApplication> = {},
): PaymentApplication => ({
  accountsPayableId: 1,
  appliedAmount: 100,
  date: "2026-09-01",
  ...overrides,
});

describe("summarizeCancelImpact", () => {
  it("suma deudas y montos que se reactivarán", () => {
    expect(
      summarizeCancelImpact([
        application({ accountsPayableId: 1, appliedAmount: 400 }),
        application({ accountsPayableId: 2, appliedAmount: 300 }),
      ]),
    ).toEqual({ debts: 2, total: 700 });
  });

  it("sin aplicaciones no hay impacto", () => {
    expect(summarizeCancelImpact([])).toEqual({ debts: 0, total: 0 });
  });
});

describe("planCreditApplication", () => {
  it("consume el saldo a favor más antiguo primero, topado al saldo de la deuda", () => {
    const credits = [
      payment({ id: 1, folio: "DEP-001", remainingAmount: 400 }),
      payment({ id: 2, folio: "DEP-002", remainingAmount: 300 }),
    ];

    expect(planCreditApplication(credits, 500)).toEqual({
      items: [
        { paymentId: 1, folio: "DEP-001", amount: 400 },
        { paymentId: 2, folio: "DEP-002", amount: 100 },
      ],
      totalApplied: 500,
      resultingBalance: 0,
    });
  });

  it("usa solo lo que cubre el saldo pendiente", () => {
    const credits = [
      payment({ id: 1, folio: "DEP-001", remainingAmount: 400 }),
      payment({ id: 2, folio: "DEP-002", remainingAmount: 300 }),
    ];

    expect(planCreditApplication(credits, 200)).toEqual({
      items: [{ paymentId: 1, folio: "DEP-001", amount: 200 }],
      totalApplied: 200,
      resultingBalance: 0,
    });
  });

  it("ignora créditos sin remanente y deudas sin saldo", () => {
    const credits = [
      payment({ id: 1, remainingAmount: 0 }),
      payment({ id: 2, remainingAmount: 300 }),
    ];

    expect(planCreditApplication(credits, 0).items).toEqual([]);
    expect(planCreditApplication(credits, 100)).toEqual({
      items: [{ paymentId: 2, folio: undefined, amount: 100 }],
      totalApplied: 100,
      resultingBalance: 0,
    });
  });
});

describe("hasAvailableCredit", () => {
  it("detecta saldo a favor disponible en una cuenta", () => {
    expect(hasAvailableCredit({ availableCredit: 250 })).toBe(true);
    expect(hasAvailableCredit({ availableCredit: 0 })).toBe(false);
    expect(hasAvailableCredit({})).toBe(false);
  });
});
