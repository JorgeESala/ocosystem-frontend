export const batchKeys = {
  all: ["batches"] as const,
  lists: (unit?: string) =>
    unit
      ? ([...batchKeys.all, "list", unit] as const)
      : ([...batchKeys.all, "list"] as const),

  details: (id: number | string) =>
    [...batchKeys.all, "detail", Number(id)] as const,

  fullDetail: (id: number | string) =>
    [...batchKeys.details(id), "full"] as const,

  sales: (batchId: number) => [...batchKeys.details(batchId), "sales"] as const,
  adjustments: (batchId: number) =>
    [...batchKeys.details(batchId), "adjustments"] as const,
};
