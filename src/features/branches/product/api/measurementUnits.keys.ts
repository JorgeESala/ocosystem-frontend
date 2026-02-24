export const measurementUnitKeys = {
  all: ["measurementUnits"] as const,
  lists: () => [...measurementUnitKeys.all, "list"] as const,
  detail: (id: number) => [...measurementUnitKeys.all, "detail", id] as const,
};
