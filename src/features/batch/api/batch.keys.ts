export const batchKeys = {
  all: ["batches"] as const,
  lists: (unit?: string, startDate?: string, endDate?: string) =>
    unit
      ? ([...batchKeys.all, "list", unit, startDate, endDate] as const)
      : ([...batchKeys.all, "list"] as const),

  details: (business: string | undefined, id: number | string) =>
    [...batchKeys.all, "detail", business ?? "public", Number(id)] as const,

  fullDetail: (business: string | undefined, id: number | string) =>
    [...batchKeys.details(business, id), "full"] as const,

  sales: (business: string | undefined, batchId: number) =>
    [...batchKeys.details(business, batchId), "sales"] as const,

  adjustments: (business: string | undefined, batchId: number) =>
    [...batchKeys.details(business, batchId), "adjustments"] as const,

  weeklySales: (
    business: string | undefined,
    startDate?: string,
    endDate?: string,
  ) =>
    [
      ...batchKeys.all,
      "weekly",
      business ?? "public",
      startDate,
      endDate,
    ] as const,

  salesByClient: (
    business: string | undefined,
    startDate?: string,
    endDate?: string,
  ) =>
    [
      ...batchKeys.all,
      "salesByClient",
      business ?? "public",
      startDate,
      endDate,
    ] as const,
};
