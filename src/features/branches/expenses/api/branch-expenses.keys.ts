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
    businessUnitCategoryId: number,
    expenseCategoryId: number | undefined,
    startDate: string,
    endDate: string,
    previousStart: string,
    previousEnd: string,
  ) =>
    [
      ...branchExpensesKeys.all,
      "comparison",
      branchIds.join(","),
      businessUnitCategoryId,
      expenseCategoryId ?? "all",
      startDate,
      endDate,
      previousStart,
      previousEnd,
    ] as const,
};
