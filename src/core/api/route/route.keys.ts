export const routeKeys = {
  all: ["routes"] as const,

  list: (business?: string) =>
    [...routeKeys.all, "list", business ?? "public"] as const,

  detail: (business: string | undefined, id: number) =>
    [...routeKeys.all, "detail", business ?? "public", id] as const,
};
