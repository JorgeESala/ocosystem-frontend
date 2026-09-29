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
};
