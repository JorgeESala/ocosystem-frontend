import { http } from "@/shared/api/http";
import { toApiDateRange } from "@/utils/date.utils";
import type { CategorySalesDTO, DailySalesDTO } from "./salesReports.api";

export interface ConsolidatedSummaryDTO {
  totalSales: number;
  totalUnits: number;
  totalTickets: number;
  realTickets: number;
  totalSlaughtered: number;
  totalChickenTickets: number;
  ticketsWithComplements: number;
  avgChickenOnlyTicketValue: number;
  avgFullTicketValue: number;
  attachRate: number;
  avgTicket: number;
  mermaQuantity: number;
  mermaValue: number;
  mermaLossQuantity: number;
}

export interface BranchSalesSummaryDTO {
  branchId: number;
  branchName: string;
  totalSales: number;
  totalTickets: number;
  realTickets: number;
  avgTicket: number;
  totalSlaughtered: number;
  mermaQuantity: number;
  mermaValue: number;
  totalChickenTickets: number;
  ticketsWithComplements: number;
  attachRate: number;
  daysWithReport: number;
}

export interface ConsolidatedSalesReportDTO {
  summary: ConsolidatedSummaryDTO;
  previousSummary: ConsolidatedSummaryDTO | null;
  branchSummary: BranchSalesSummaryDTO[];
  previousBranchSummary: BranchSalesSummaryDTO[];
  dailySales: DailySalesDTO[];
  categories: CategorySalesDTO[];
}

export const fetchConsolidatedSalesReport = async (
  branchIds: number[],
  start: Date,
  end: Date,
) => {
  const range = toApiDateRange(start, end);
  const params = new URLSearchParams();
  branchIds.forEach((id) => params.append("branchIds", id.toString()));
  params.append("startDate", range.startDate);
  params.append("endDate", range.endDate);
  params.append("compare", "true");

  const { data } = await http.get<ConsolidatedSalesReportDTO>(
    `/api/reports/sales/consolidated?${params.toString()}`,
  );
  return data;
};
