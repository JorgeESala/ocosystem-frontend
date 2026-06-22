import type { Batch, BranchesBatchSale } from "@/services/api";

export const getCuentaKey = (
  sale: Pick<BranchesBatchSale, "date" | "id">,
  batch: Pick<Batch, "branchId">,
): string => {
  if (batch.branchId != null) return `b:${batch.branchId}:${sale.date}`;
  return `__solo:${sale.id}`;
};

export interface PendingCuenta {
  key: string;
  clientId: number | null;
  clientName: string;
  branchId: number | null;
  date: string;
  sales: Array<{ sale: BranchesBatchSale; batchId: number }>;
}
