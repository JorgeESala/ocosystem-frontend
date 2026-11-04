export const routeOrderKeys = {
  all: ["route-orders"] as const,
  days: () => [...routeOrderKeys.all, "day"] as const,
  day: (slug: string, date: string) =>
    [...routeOrderKeys.days(), slug, date] as const,
  sheets: () => [...routeOrderKeys.all, "sheet"] as const,
  sheet: (slug: string, routeId: number, date: string) =>
    [...routeOrderKeys.sheets(), slug, routeId, date] as const,
};
