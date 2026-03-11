export const salesReportKeys = {
  all: ["salesReports"] as const,
  reports: () => [...salesReportKeys.all, "report"] as const,
  byFilters: (branchId: number, startDate: Date, endDate: Date) =>
    [...salesReportKeys.reports(), { branchId, startDate, endDate }] as const,
};
