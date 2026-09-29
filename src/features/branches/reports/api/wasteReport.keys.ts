export const wasteReportKeys = {
  all: ["wasteReport"] as const,
  report: (branchIds: number[], startDate: Date, endDate: Date) =>
    [
      ...wasteReportKeys.all,
      "report",
      { branchIds, startDate, endDate },
    ] as const,
};
