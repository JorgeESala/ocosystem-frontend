export const productAnalyticsKeys = {
  all: ["productAnalytics"] as const,
  list: (
    branchIds: number[],
    startDate: Date,
    endDate: Date,
    limit: number,
    offset: number,
    sort: string,
    categoryId?: number,
    search?: string,
    excludeChicken?: boolean,
    excludeEgg?: boolean,
  ) =>
    [
      ...productAnalyticsKeys.all,
      "list",
      {
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
      },
    ] as const,
  detail: (
    barcode: string,
    branchIds: number[],
    startDate: Date,
    endDate: Date,
  ) =>
    [
      ...productAnalyticsKeys.all,
      "detail",
      { barcode, branchIds, startDate, endDate },
    ] as const,
};
