export const incomeStatementKeys = {
  all: ["income-statement"] as const,
  report: (unitType: string, startDate?: string, endDate?: string) =>
    [...incomeStatementKeys.all, unitType, startDate, endDate] as const,
};
