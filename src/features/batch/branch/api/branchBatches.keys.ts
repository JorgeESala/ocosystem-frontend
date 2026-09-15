export const branchBatchesKeys = {
  all: ["batches"] as const,

  latest: (business?: string) =>
    [...branchBatchesKeys.all, "latest", business ?? "public"] as const,

  search: (
    business: string | undefined,
    branchIds: number[],
    startDate: Date | null,
    endDate: Date | null,
  ) =>
    [
      ...branchBatchesKeys.all,
      "search",
      business ?? "public",
      branchIds,
      startDate,
      endDate,
    ] as const,
};
