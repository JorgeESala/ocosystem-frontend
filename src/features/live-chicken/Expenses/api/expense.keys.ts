export const expenseKeys = {
  all: ["expenses"] as const,

  latest: () => [...expenseKeys.all, "latest"] as const,

  between: (start: string, end: string) =>
    [...expenseKeys.all, "between", start, end] as const,

  detail: (id: number) => [...expenseKeys.all, "detail", id] as const,
};
