export const eggCashFlowKeys = {
  all: ["egg-cash-flow"] as const,
  settings: () => [...eggCashFlowKeys.all, "settings"] as const,
  summary: (from: string, to: string) =>
    [...eggCashFlowKeys.all, "summary", { from, to }] as const,
  movements: (from: string, to: string) =>
    [...eggCashFlowKeys.all, "movements", { from, to }] as const,
  tripSuggestions: (from: string, to: string) =>
    [...eggCashFlowKeys.all, "trip-suggestions", { from, to }] as const,
  collectionSuggestions: (from: string, to: string) =>
    [...eggCashFlowKeys.all, "collection-suggestions", { from, to }] as const,
  remesas: () => [...eggCashFlowKeys.all, "remesas"] as const,
  availableExpenses: (from: string, to: string) =>
    [...eggCashFlowKeys.all, "available-expenses", { from, to }] as const,
  cuts: () => [...eggCashFlowKeys.all, "cuts"] as const,
};
