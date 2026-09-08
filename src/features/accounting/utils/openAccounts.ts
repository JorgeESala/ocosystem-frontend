import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { movementTypeLabels } from "@/features/live-chicken/accounting/accounts-payable/types";

export type AccountSortKey = "date" | "total" | "balance";
export type SortDir = "asc" | "desc";

export const buildAccountSearchText = (row: AccountsPayableResponse): string =>
  [
    row.debtorName,
    row.creditorName,
    row.note,
    row.solicitorName,
    row.sourceType,
    String(row.sourceId ?? ""),
    String(row.sourceBatchId ?? ""),
    String(row.id),
    String(row.totalAmount),
    row.totalAmount.toFixed(2),
    String(row.balance),
    row.balance.toFixed(2),
  ]
    .filter((v) => v !== undefined && v !== null && v !== "")
    .join(" ")
    .toLowerCase();

export const filterAccountsBySearch = (
  rows: AccountsPayableResponse[],
  query: string,
): AccountsPayableResponse[] => {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((r) => buildAccountSearchText(r).includes(q));
};

export const applyAccountSort = (
  rows: AccountsPayableResponse[],
  key: AccountSortKey,
  dir: SortDir,
): AccountsPayableResponse[] => {
  const sorted = [...rows].sort((a, b) => {
    if (key === "date") return a.date.localeCompare(b.date);
    if (key === "total") return a.totalAmount - b.totalAmount;
    return a.balance - b.balance;
  });
  return dir === "desc" ? sorted.reverse() : sorted;
};
export interface StatementMovementRow {
  key: string;
  movementDate: string;
  movementType: string;
  amount: number;
  balanceAfter: number;
  folio?: string | null;
  note?: string | null;
}

export const statementRowLabel = (movementType: string): string => {
  if (movementType === "CHARGE") return "Cargo";
  return (
    (movementTypeLabels as Record<string, string>)[movementType] ?? movementType
  );
};
