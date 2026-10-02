export const POS_REPORTED_SALES_SOURCE = "POS_REPORTED_SALES";

const ENTRY_TYPE_LABELS: Record<string, string> = {
  INCOME_SALES: "Venta",
  INCOME_OTHER: "Ingreso",
  EXPENSE_OPERATIONAL: "Gasto",
  EXPENSE_BATCH: "Compra pollo",
  PAYMENT_OUT: "Pago",
  OTHER: "Ajuste",
};

interface CashHistoryEntryLike {
  entryType: string;
  sourceType: string | null;
}

export const isPosReportedSale = (entry: CashHistoryEntryLike): boolean =>
  entry.sourceType === POS_REPORTED_SALES_SOURCE;

export const cashHistoryLabel = (entry: CashHistoryEntryLike): string =>
  isPosReportedSale(entry)
    ? "POS otros productos"
    : (ENTRY_TYPE_LABELS[entry.entryType] ?? entry.entryType);

export const filterPosReportedSales = <T extends CashHistoryEntryLike>(
  entries: T[],
  showPosSales: boolean,
): T[] =>
  showPosSales ? entries : entries.filter((entry) => !isPosReportedSale(entry));
