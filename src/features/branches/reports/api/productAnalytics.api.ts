import { http } from "@/shared/api/http";
import { toLocalDateString } from "@/utils/date.utils";

export interface ProductBranchBreakdownDTO {
  branchId: number;
  branchName: string;
  quantity: number;
  sales: number;
}

export interface ProductAnalyticsRowDTO {
  productBarcode: string;
  productName: string;
  categoryName: string;
  unitName: string;
  quantity: number;
  sales: number;
  daysWithSales: number;
  avgDailyQuantity: number;
  previousQuantity: number;
  previousSales: number;
  salesGrowth: number | null;
  cancelledQuantity: number;
  cancelledSubtotal: number;
  branchBreakdown: ProductBranchBreakdownDTO[];
  abcClass: "A" | "B" | "C";
}

export interface ProductAnalyticsDTO {
  startDate: string;
  endDate: string;
  total: number;
  products: ProductAnalyticsRowDTO[];
}

export interface ProductDailyPointDTO {
  day: string;
  quantity: number;
  sales: number;
  cancelledQuantity: number;
  cancelledSubtotal: number;
}

export interface ProductBranchSeriesDTO {
  branchId: number;
  branchName: string;
  quantity: number;
  sales: number;
  daysWithSales: number;
  daily: ProductDailyPointDTO[];
}

export interface ProductDetailDTO {
  productBarcode: string;
  productName: string;
  categoryName: string;
  unitName: string;
  branches: ProductBranchSeriesDTO[];
}

export interface ProductAnalyticsQuery {
  limit?: number;
  offset?: number;
  sort?: "sales" | "quantity";
  categoryId?: number;
  search?: string;
  excludeChicken?: boolean;
  excludeEgg?: boolean;
}

const BASE_URL = "/api/reports/products";

export const fetchProductAnalytics = async (
  branchIds: number[],
  start: Date,
  end: Date,
  {
    limit = 10,
    offset = 0,
    sort = "sales",
    categoryId,
    search,
    excludeChicken = false,
    excludeEgg = false,
  }: ProductAnalyticsQuery = {},
) => {
  const params = new URLSearchParams();
  branchIds.forEach((id) => params.append("branchIds", id.toString()));
  params.append("start", toLocalDateString(start));
  params.append("end", toLocalDateString(end));
  params.append("limit", String(limit));
  params.append("offset", String(offset));
  params.append("sort", sort);
  params.append("excludeChicken", String(excludeChicken));
  params.append("excludeEgg", String(excludeEgg));
  if (categoryId != null) params.append("categoryId", String(categoryId));
  if (search && search.trim().length > 0)
    params.append("search", search.trim());

  const { data } = await http.get<ProductAnalyticsDTO>(
    `${BASE_URL}?${params.toString()}`,
  );
  return data;
};

export const fetchProductDetail = async (
  barcode: string,
  branchIds: number[],
  start: Date,
  end: Date,
) => {
  const params = new URLSearchParams();
  branchIds.forEach((id) => params.append("branchIds", id.toString()));
  params.append("start", toLocalDateString(start));
  params.append("end", toLocalDateString(end));

  const { data } = await http.get<ProductDetailDTO>(
    `${BASE_URL}/${encodeURIComponent(barcode)}?${params.toString()}`,
  );
  return data;
};
