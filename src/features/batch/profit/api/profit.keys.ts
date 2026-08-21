export const profitKeys = {
  all: ["profit"] as const,
  report: (unitType: string, startDate?: string, endDate?: string) =>
    [...profitKeys.all, unitType, startDate, endDate] as const,
};
