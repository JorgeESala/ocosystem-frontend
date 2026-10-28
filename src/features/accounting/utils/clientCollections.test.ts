import { describe, expect, it } from "vitest";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import type { PaymentResponse } from "../types/payment.types";
import {
  isDuplicatePayment,
  previewClientCollection,
  summarizeClientDebts,
} from "./clientCollections";

const debt = (
  overrides: Partial<AccountsPayableResponse> = {},
): AccountsPayableResponse => ({
  id: 1,
  debtorId: 10,
  debtorName: "Cliente",
  creditorId: 1,
  creditorName: "CEDIS Norte",
  totalAmount: 500,
  balance: 500,
  date: "2026-09-01",
  note: "",
  ...overrides,
});

describe("clientCollections", () => {
  it("summarizes total debt, oldest debt and balances per CEDIS", () => {
    const summary = summarizeClientDebts([
      debt({ id: 1, creditorId: 1, balance: 500, date: "2026-09-01" }),
      debt({
        id: 2,
        creditorId: 1,
        creditorName: "CEDIS Norte",
        balance: 100,
        date: "2026-09-10",
      }),
      debt({
        id: 3,
        creditorId: 2,
        creditorName: "CEDIS Sur",
        balance: 300,
        date: "2026-09-05",
      }),
      debt({ id: 4, creditorId: 2, balance: 0 }),
    ]);

    expect(summary.totalDebt).toBe(900);
    expect(summary.debtCount).toBe(3);
    expect(summary.oldestDebtDate).toBe("2026-09-01");
    expect(summary.largestCedisId).toBe(1);
    expect(summary.cedis).toEqual([
      {
        creditorId: 1,
        creditorName: "CEDIS Norte",
        balance: 600,
        debtCount: 2,
        oldestDebtDate: "2026-09-01",
      },
      {
        creditorId: 2,
        creditorName: "CEDIS Sur",
        balance: 300,
        debtCount: 1,
        oldestDebtDate: "2026-09-05",
      },
    ]);
  });

  it("splits the paid amount between the selected CEDIS and saldo a favor", () => {
    expect(previewClientCollection(600, 600)).toEqual({
      appliedAmount: 600,
      parkedAmount: 0,
    });
    expect(previewClientCollection(600, 750)).toEqual({
      appliedAmount: 600,
      parkedAmount: 150,
    });
    expect(previewClientCollection(600, 0)).toEqual({
      appliedAmount: 0,
      parkedAmount: 0,
    });
  });

  it("detects an active payment with the same amount and date", () => {
    const payment: PaymentResponse = {
      id: 1,
      amount: 500,
      paymentDate: "2026-09-01",
      paymentMethod: "CASH",
      status: "ACTIVE",
      createdAt: "2026-09-01T10:00:00",
    };

    expect(isDuplicatePayment([payment], 500, "2026-09-01")).toBe(true);
    expect(isDuplicatePayment([payment], 501, "2026-09-01")).toBe(false);
    expect(
      isDuplicatePayment(
        [{ ...payment, status: "CANCELLED" }],
        500,
        "2026-09-01",
      ),
    ).toBe(false);
  });
});
