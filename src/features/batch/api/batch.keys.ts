export const batchKeys = {
  all: ["batches"] as const,
  lists: (unit?: string, startDate?: string, endDate?: string) =>
    unit
      ? ([...batchKeys.all, "list", unit, startDate, endDate] as const)
      : ([...batchKeys.all, "list"] as const),

  details: (id: number | string) =>
    [...batchKeys.all, "detail", Number(id)] as const,

  fullDetail: (id: number | string) =>
    [...batchKeys.details(id), "full"] as const,

  sales: (batchId: number) => [...batchKeys.details(batchId), "sales"] as const,
  adjustments: (batchId: number) =>
    [...batchKeys.details(batchId), "adjustments"] as const,
  weeklySales: (startDate?: string, endDate?: string) =>
    [...batchKeys.all, "weekly", startDate, endDate] as const,
  salesByClient: (startDate?: string, endDate?: string) =>
    [...batchKeys.all, "salesByClient", startDate, endDate] as const,
};
