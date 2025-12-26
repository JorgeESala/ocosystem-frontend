export const inboundBatchKeys = {
  all: ["live-chicken", "inbound-batches"] as const,

  lists: () => [...inboundBatchKeys.all, "list"] as const,

  list: (filters?: unknown) =>
    [...inboundBatchKeys.lists(), { filters }] as const,

  latest: (limit: number) =>
    [...inboundBatchKeys.all, "latest", limit] as const,

  detail: (id: number) => [...inboundBatchKeys.all, "detail", id] as const,

  range: (startDate: Date, endDate: Date) =>
    [
      ...inboundBatchKeys.lists(),
      "range",
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ] as const,
};
