export const profitKeys = {
  all: ["profit"] as const,
  report: (startDate?: string, endDate?: string) =>
    [...profitKeys.all, startDate, endDate] as const,
};
