export interface DailySalesDTO {
  date: string;
  chickenByBranch: Record<string, number>;
  eggsByBranch: Record<string, number>;
  totalChicken: number;
  totalEggs: number;
}

export interface WeeklySummaryDTO {
  weekLabel: string;
  chickenByBranch: Record<string, number>;
  eggsByBranch: Record<string, number>;
  totalChicken: number;
  totalEggs: number;
}

export interface BranchGrowthDTO {
  branchId: number;
  branchName: string;
  currentChicken: number;
  previousChicken: number;
  chickenGrowth: number;
  currentEggs: number;
  previousEggs: number;
  eggsGrowth: number;
}

export interface SummaryDTO {
  totalChicken: number;
  totalEggs: number;
  chickenGrowth: number;
  eggsGrowth: number;
  avgDailyChicken: number;
  avgDailyEggs: number;
  daysInRange: number;
}

export interface SalesAnalyticsDTO {
  startDate: string;
  endDate: string;
  dailySales: DailySalesDTO[];
  weeklySummary: WeeklySummaryDTO[];
  branchGrowth: BranchGrowthDTO[];
  summary: SummaryDTO;
}
