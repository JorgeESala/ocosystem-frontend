import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import type { PaymentResponse } from "../types/payment.types";

export interface CedisDebtGroup {
  creditorId: number;
  creditorName: string;
  balance: number;
  debtCount: number;
  oldestDebtDate: string | null;
}

export interface ClientDebtSummary {
  totalDebt: number;
  debtCount: number;
  oldestDebtDate: string | null;
  cedis: CedisDebtGroup[];
  largestCedisId: number | null;
}

export interface ClientCollectionPreview {
  appliedAmount: number;
  parkedAmount: number;
}

const oldest = (current: string | null, candidate: string | null) => {
  if (!candidate) return current;
  if (!current) return candidate;
  return candidate < current ? candidate : current;
};

export const summarizeClientDebts = (
  debts: AccountsPayableResponse[],
): ClientDebtSummary => {
  const openDebts = debts.filter((debt) => debt.balance > 0);
  const grouped = new Map<
    number,
    {
      creditorId: number;
      creditorName: string;
      balance: number;
      debtCount: number;
      oldestDebtDate: string | null;
    }
  >();

  let totalDebt = 0;
  let oldestDebtDate: string | null = null;

  for (const debt of openDebts) {
    totalDebt += debt.balance;
    oldestDebtDate = oldest(oldestDebtDate, debt.date);

    const current = grouped.get(debt.creditorId);
    if (current) {
      current.balance += debt.balance;
      current.debtCount += 1;
      current.oldestDebtDate = oldest(current.oldestDebtDate, debt.date);
    } else {
      grouped.set(debt.creditorId, {
        creditorId: debt.creditorId,
        creditorName: debt.creditorName,
        balance: debt.balance,
        debtCount: 1,
        oldestDebtDate: debt.date,
      });
    }
  }

  const cedis = [...grouped.values()].sort(
    (a, b) =>
      b.balance - a.balance ||
      a.creditorName.localeCompare(b.creditorName, "es"),
  );

  return {
    totalDebt,
    debtCount: openDebts.length,
    oldestDebtDate,
    cedis,
    largestCedisId: cedis[0]?.creditorId ?? null,
  };
};

export const previewClientCollection = (
  cedisBalance: number,
  amount: number,
): ClientCollectionPreview => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { appliedAmount: 0, parkedAmount: 0 };
  }
  const appliedAmount = Math.min(amount, Math.max(0, cedisBalance));
  return {
    appliedAmount,
    parkedAmount: Math.max(0, amount - appliedAmount),
  };
};

export const isDuplicatePayment = (
  payments: PaymentResponse[],
  amount: number,
  paymentDate: string,
) =>
  payments.some(
    (payment) =>
      payment.status === "ACTIVE" &&
      payment.paymentDate === paymentDate &&
      Math.abs(payment.amount - amount) < 0.005,
  );
