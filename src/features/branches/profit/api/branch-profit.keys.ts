export const branchProfitKeys = {
  all: ["branch-profit"] as const,
  report: (branchIds: number[], startDate: string, endDate: string) =>
    [
      ...branchProfitKeys.all,
      "report",
      { branchIds, startDate, endDate },
    ] as const,
};
