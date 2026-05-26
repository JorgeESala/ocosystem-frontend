export const branchExpensesKeys = {
  all: ["branch-expenses"] as const,
  latest: () => [...branchExpensesKeys.all, "latest"] as const,
  search: (branchIds: number[], startDate: string, endDate: string) =>
    [...branchExpensesKeys.all, "search", branchIds.join(","), startDate, endDate] as const,
};
