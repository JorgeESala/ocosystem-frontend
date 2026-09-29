import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchProductAnalytics,
  fetchProductDetail,
  type ProductAnalyticsQuery,
} from "./productAnalytics.api";
import { productAnalyticsKeys } from "./productAnalytics.keys";

export const useProductAnalytics = (
  branchIds: number[],
  startDate: Date,
  endDate: Date,
  query: ProductAnalyticsQuery = {},
) => {
  const {
    limit = 10,
    offset = 0,
    sort = "sales",
    categoryId,
    search,
    excludeChicken = false,
    excludeEgg = false,
  } = query;

  return useQuery({
    queryKey: productAnalyticsKeys.list(
      branchIds,
      startDate,
      endDate,
      limit,
      offset,
      sort,
      categoryId,
      search,
      excludeChicken,
      excludeEgg,
    ),
    queryFn: () => fetchProductAnalytics(branchIds, startDate, endDate, query),
    enabled: branchIds.length > 0 && !!startDate && !!endDate,
    placeholderData: keepPreviousData,
  });
};

export const useProductDetail = (
  barcode: string | null,
  branchIds: number[],
  startDate: Date,
  endDate: Date,
) => {
  return useQuery({
    queryKey: productAnalyticsKeys.detail(
      barcode ?? "",
      branchIds,
      startDate,
      endDate,
    ),
    queryFn: () =>
      fetchProductDetail(barcode as string, branchIds, startDate, endDate),
    enabled: !!barcode && branchIds.length > 0 && !!startDate && !!endDate,
  });
};
