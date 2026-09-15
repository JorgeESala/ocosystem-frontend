export const inboundBatchKeys = {
  all: ["live-chicken", "inbound-batches"] as const,

  lists: (business?: string) =>
    [...inboundBatchKeys.all, "list", business ?? "public"] as const,

  list: (business: string | undefined, filters?: unknown) =>
    [...inboundBatchKeys.lists(business), { filters }] as const,

  latest: (business: string | undefined, limit: number) =>
    [...inboundBatchKeys.all, "latest", business ?? "public", limit] as const,

  detail: (business: string | undefined, id: number) =>
    [...inboundBatchKeys.all, "detail", business ?? "public", id] as const,

  range: (business: string | undefined, startDate: Date, endDate: Date) =>
    [
      ...inboundBatchKeys.lists(business),
      "range",
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ] as const,
};
