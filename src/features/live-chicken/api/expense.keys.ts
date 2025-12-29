export const expenseKeys = {
  all: ["expenses"] as const,

  lists: () => [...expenseKeys.all, "list"] as const,
  list: () => [...expenseKeys.lists()] as const,

  latest: () => [...expenseKeys.all, "latest"] as const,

  detail: (id: number) => [...expenseKeys.all, "detail", id] as const,
};
