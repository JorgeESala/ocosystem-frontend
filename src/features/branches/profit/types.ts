export interface BranchProfitBatchDetailDTO {
  batchId: number;
  branchName: string;
  totalBatchCost: number;
  chickenQuantity: number;
  avgChickenWeight: number;
  pricePerKg: number;
  quantitySoldInRange: number;
  kgSoldInRange: number;
  computedCostForRange: number;
  totalSalesInRange: number;
  aspKg: number;
}

export interface BranchProfitCashDetailDTO {
  branchId: number;
  branchName: string;
  businessUnitName: string;
  totalSales: number;
  totalExpenses: number;
  expectedCash: number;
}

export interface BranchProfitReportDTO {
  start: string;
  end: string;
  totalSales: number;
  totalExpenses: number;
  totalChickenCostsProRated: number;
  profit: number;
  batchDetails: BranchProfitBatchDetailDTO[];
  cashDetails: BranchProfitCashDetailDTO[];
}

export interface BranchProfitFilters {
  branchIds: number[];
  startDate: Date;
  endDate: Date;
}
