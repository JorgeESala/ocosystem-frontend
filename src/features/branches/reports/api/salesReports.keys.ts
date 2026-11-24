export const salesReportKeys = {
  all: ["salesReports"] as const,
  reports: () => [...salesReportKeys.all, "report"] as const,
  byFilters: (branchId: number, startDate: Date, endDate: Date) =>
    [...salesReportKeys.reports(), { branchId, startDate, endDate }] as const,
  consolidated: (branchIds: number[], startDate: Date, endDate: Date) =>
    [
      ...salesReportKeys.all,
      "consolidated",
      { branchIds, startDate, endDate },
    ] as const,
  expected: (branchIds: number[], startDate: Date, endDate: Date) =>
    [
      ...salesReportKeys.all,
      "expected",
      { branchIds, startDate, endDate },
    ] as const,
  referenceProducts: (asOf: string) =>
    [...salesReportKeys.all, "reference-products", asOf] as const,
};
