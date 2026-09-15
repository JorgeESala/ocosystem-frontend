export const salesKeys = {
  all: ["batchSales"] as const,

  lists: (business?: string) =>
    [...salesKeys.all, business ?? "public"] as const,

  list: (business: string | undefined, batchId: number) =>
    [...salesKeys.lists(business), batchId] as const,

  byBatches: (business: string | undefined, batchIds: number[]) =>
    [...salesKeys.lists(business), "by-batches", batchIds] as const,
};
