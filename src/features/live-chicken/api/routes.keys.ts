export const routeKeys = {
  all: ["routes"] as const,
  list: () => [...routeKeys.all, "list"] as const,
  detail: (id: number) => [...routeKeys.all, "detail", id] as const,
};
