export const branchCategoriesKeys = {
  all: ["branch-expense-categories"] as const,
  businessUnits: () => [...branchCategoriesKeys.all, "business-units"] as const,
  expenseCategories: () =>
    [...branchCategoriesKeys.all, "expense-categories"] as const,
};
