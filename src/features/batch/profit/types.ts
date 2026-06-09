export interface ProfitReport {
  start: string;
  end: string;
  totalSales: number;
  totalExpenses: number;
  totalChickenCostsProRated: number;
  profit: number;
  batchDetails: BatchProfitDetail[];
  cashDetails: CashDetail[];
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
}

export interface CashDetail {
  businessUnit: string;
  totalCashSales: number;
  totalExpenses: number;
  netCash: number;
}
