import { describe, expect, it } from "vitest";
import {
  hasUnappliedCredit,
  isReversibleMovement,
  isStandaloneAccount,
  splitPaymentApplication,
  totalUnapplied,
} from "./unappliedCredit";
import type { PaymentResponse } from "../types/payment.types";
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
