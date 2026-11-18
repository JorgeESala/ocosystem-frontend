import { http } from "@/shared/api/http";
import { toApiDateRange } from "@/utils/date.utils";

export interface ExpectedSalesSummaryDTO {
  expectedKg: number | null;
  reportedKg: number | null;
  differenceKg: number | null;
  variancePct: number | null;
  birdsSold: number;
  avgChickenWeight: number | null;
  salesCount: number;
  salesWithoutWeight: number;
  salesWithoutReportedKg: number;
  daysWithData: number;
  wastePerChickenKg: number;
}

export interface BranchExpectedSalesDTO {
  branchId: number;
  branchName: string;
  expectedKg: number | null;
  reportedKg: number | null;
  differenceKg: number | null;
  variancePct: number | null;
  birdsSold: number;
  avgChickenWeight: number | null;
  salesCount: number;
  salesWithoutWeight: number;
  salesWithoutReportedKg: number;
  daysWithData: number;
}

export interface DailyExpectedSalesDTO {
  branchId: number;
  branchName: string;
  day: string;
  expectedKg: number | null;
  reportedKg: number | null;
  differenceKg: number | null;
  variancePct: number | null;
  birdsSold: number;
  avgChickenWeight: number | null;
  salesCount: number;
  salesWithoutWeight: number;
  salesWithoutReportedKg: number;
}

export interface ExpectedSalesReportDTO {
  summary: ExpectedSalesSummaryDTO;
  branches: BranchExpectedSalesDTO[];
  daily: DailyExpectedSalesDTO[];
}

export const fetchExpectedSalesReport = async (
  branchIds: number[],
  start: Date,
  end: Date,
) => {
  const range = toApiDateRange(start, end);
  const params = new URLSearchParams();
  branchIds.forEach((id) => params.append("branchIds", id.toString()));
  params.append("startDate", range.startDate);
  params.append("endDate", range.endDate);

  const { data } = await http.get<ExpectedSalesReportDTO>(
    `/api/reports/sales/expected?${params.toString()}`,
  );
  return data;
};
