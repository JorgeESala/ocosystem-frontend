import { describe, expect, it } from "vitest";
import {
  hasUnappliedCredit,
  splitPaymentApplication,
  totalUnapplied,
} from "./unappliedCredit";
import type { PaymentResponse } from "../types/payment.types";

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
