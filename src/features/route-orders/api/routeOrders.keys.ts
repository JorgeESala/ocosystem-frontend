export const routeOrderKeys = {
  all: ["route-orders"] as const,
  days: () => [...routeOrderKeys.all, "day"] as const,
  day: (slug: string, date: string) =>
    [...routeOrderKeys.days(), slug, date] as const,
  sheets: () => [...routeOrderKeys.all, "sheet"] as const,
  sheet: (slug: string, routeId: number, date: string) =>
    [...routeOrderKeys.sheets(), slug, routeId, date] as const,
  saleCandidates: () => [...routeOrderKeys.all, "sale-candidates"] as const,
  saleCandidatesByDate: (slug: string, date: string) =>
    [...routeOrderKeys.saleCandidates(), slug, date] as const,
  pendingQuantity: (slug: string, startDate: string, endDate: string) =>
    [
      ...routeOrderKeys.all,
      "pending-quantity",
      slug,
      startDate,
      endDate,
    ] as const,
  pendingQuantityBreakdown: (
    slug: string,
    startDate: string,
    endDate: string,
  ) =>
    [
      ...routeOrderKeys.pendingQuantity(slug, startDate, endDate),
      "breakdown",
    ] as const,
};
