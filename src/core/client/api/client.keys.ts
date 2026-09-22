export const clientKeys = {
  all: ["clients"] as const,

  lists: (business?: string) =>
    [...clientKeys.all, "list", business ?? "public"] as const,

  list: (business: string | undefined, includeInactive: boolean) =>
    [
      ...clientKeys.lists(business),
      includeInactive ? "all" : "active",
    ] as const,

  details: (business: string | undefined, id: number) =>
    [...clientKeys.all, "detail", business ?? "public", id] as const,

  purchases: (
    business: string | undefined,
    id: number,
    startDate: string,
    endDate: string,
  ) =>
    [
      ...clientKeys.all,
      "purchases",
      business ?? "public",
      id,
      startDate,
      endDate,
    ] as const,
};
