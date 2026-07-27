import { http } from "@/shared/api/http";
import { toApiDateRange } from "@/utils/date.utils";

// Interfaces basadas en tus Records de Java
export interface CategorySalesDTO {
  categoryId: number;
  categoryName: string;
  totalSales: number;
  quantitySold: number;
}

export interface DailySalesDTO {
  day: string; // LocalDate llega como string ISO
  totalSales: number;
  totalTickets: number;
  realTickets: number;
}

export interface DailyCategorySalesDTO {
  day: string;
  categoryName: string;
  totalSales: number;
  quantitySold: number;
}

export interface ProductSalesDTO {
  productBarcode: string;
  productName: string;
  categoryName: string;
  quantitySold: number;
  totalSales: number;
  unitName: string;
  attachmentFrequency: number;
}

export interface SalesSummaryDTO {
  totalSales: number;
  totalUnits: number;
  totalSlaughtered: number;
  totalTickets: number;
  realTickets: number;
  totalChickenTickets: number;
  ticketsWithComplements: number;
  avgChickenOnlyTicketValue: number;
  avgFullTicketValue: number;
}

export interface SalesReportDTO {
  summary: SalesSummaryDTO;
  products: ProductSalesDTO[];
  categories: CategorySalesDTO[];
  dailySales: DailySalesDTO[];
  dailyCategorySales: DailyCategorySalesDTO[];
}
export const fetchSalesReport = async (
  branchId: number,
  start: Date,
  end: Date,
) => {
  const params = { branchId, ...toApiDateRange(start, end) };
  const { data } = await http.get<SalesReportDTO>(`/api/reports/sales`, {
    params,
  });
  return data;
};
