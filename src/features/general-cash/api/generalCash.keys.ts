export const cashReserveKeys = {
  all: ["general-cash"] as const,
  list: () => [...cashReserveKeys.all, "list"] as const,
  detail: (id: number) => [...cashReserveKeys.all, "detail", id] as const,
  flow: (id: number, start: string, end: string, frequency: string) =>
    [...cashReserveKeys.all, "flow", { id, start, end, frequency }] as const,
  alerts: () => [...cashReserveKeys.all, "alerts"] as const,
};
