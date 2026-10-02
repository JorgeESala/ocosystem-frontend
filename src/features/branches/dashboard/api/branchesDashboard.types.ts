export type ReconciliationStatus =
  | "NO_DATA"
  | "INCOMPLETE"
  | "MATCH"
  | "DIFFERENCE";

export interface BranchesDashboardSummaryDTO {
  totalSales: number;
  previousTotalSales: number | null;
  chickenSales: number;
  previousChickenSales: number | null;
  otherProductsSales: number;
  previousOtherProductsSales: number | null;
  chickenCosts: number;
  chickenProfit: number;
  mermaLossQuantity: number;
  trimmedBranches: number;
}

export interface BranchesDashboardCoverageDTO {
  totalBranches: number;
  branchesWithPosReport: number;
  branchesWithChickenSales: number;
}

export interface BranchesDashboardBranchDTO {
  branchId: number;
  branchName: string;
  totalSales: number;
  previousTotalSales: number | null;
  chickenSales: number;
  otherProductsSales: number;
  chickenPosSales: number;
  posDays: number;
  chickenDays: number;
  mermaLossQuantity: number;
  reconciliationStatus: ReconciliationStatus;
  chickenVariancePct: number | null;
  comparisonTrimmed: boolean;
  trimmedDays: number;
}

export interface BranchesDashboardDailyDTO {
  day: string;
  totalSales: number;
  chickenSales: number;
  otherProductsSales: number;
}

export interface BranchesDashboardDTO {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  summary: BranchesDashboardSummaryDTO;
  coverage: BranchesDashboardCoverageDTO;
  branches: BranchesDashboardBranchDTO[];
  daily: BranchesDashboardDailyDTO[];
}
