export const inboundBatchSalesKeys = {
  all: ["inboundBatchSales"] as const,

  lists: (business?: string) =>
    [...inboundBatchSalesKeys.all, "list", business ?? "public"] as const,

  list: (business: string | undefined, batchId: number) =>
    [...inboundBatchSalesKeys.lists(business), batchId] as const,
};
