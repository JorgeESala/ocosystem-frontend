export interface ProfitReport {
  start: string;
  end: string;
  totalSales: number;
  totalExpenses: number;
  totalChickenCostsProRated: number;
  totalMermaCost: number;
  profit: number;
  batchDetails: BatchProfitDetail[];
  expenseBreakdown: ExpenseBreakdownItem[];
}

export interface BatchProfitDetail {
  batchId: number;
  branchName: string | null;
  totalBatchCost: number;
  chickenQuantity: number | null;
  avgChickenWeight: number | null;
  pricePerKg: number | null;
  quantitySoldInRange: number;
  kgSoldInRange: number | null;
  computedCostForRange: number;
  totalSalesInRange: number;
  aspKg: number | null;
  entityName: string;
  entryDate: string;
  type: "EGG" | "LIVE_CHICKEN" | "PORK";
  initialQuantity: number;
  adjustedQuantityInRange: number;
  mermaCostForRange: number;
}

export interface ExpenseBreakdownItem {
  categoryCode: string;
  categoryName: string;
  amount: number;
  count: number;
}
