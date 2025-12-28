export const inboundBatchSalesKeys = {
  all: ["inboundBatchSales"] as const,

  lists: () => [...inboundBatchSalesKeys.all, "list"] as const,

  list: (batchId: number) =>
    [...inboundBatchSalesKeys.lists(), batchId] as const,
};
