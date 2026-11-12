export const branchExpensesKeys = {
  all: ["branch-expenses"] as const,
  latest: () => [...branchExpensesKeys.all, "latest"] as const,
  search: (branchIds: number[], startDate: string, endDate: string) =>
    [
      ...branchExpensesKeys.all,
      "search",
      branchIds.join(","),
      startDate,
      endDate,
    ] as const,
  comparison: (
    branchIds: number[],
    businessUnitCategoryIds: number[],
    expenseCategoryIds: number[],
    reason: string,
    startDate: string,
    endDate: string,
    previousStart: string,
    previousEnd: string,
  ) =>
    [
      ...branchExpensesKeys.all,
      "comparison",
      branchIds.join(","),
      businessUnitCategoryIds.join(","),
      expenseCategoryIds.join(","),
      reason,
      startDate,
      endDate,
      previousStart,
      previousEnd,
    ] as const,
};
