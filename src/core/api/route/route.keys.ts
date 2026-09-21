export const routeKeys = {
  all: ["routes"] as const,

  list: (business?: string) =>
    [...routeKeys.all, "list", business ?? "public"] as const,

  listWithInactive: (business?: string) =>
    [...routeKeys.all, "list", business ?? "public", "all"] as const,

  detail: (business: string | undefined, id: number) =>
    [...routeKeys.all, "detail", business ?? "public", id] as const,

  performance: (
    business: string | undefined,
    startDate: string,
    endDate: string,
  ) =>
    [
      ...routeKeys.all,
      "performance",
      business ?? "public",
      startDate,
      endDate,
    ] as const,
};
