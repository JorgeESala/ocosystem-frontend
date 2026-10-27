import type { EggCashFlowUnit } from "../types/eggCashFlow.types";

export const eggCashFlowKeys = (unit: EggCashFlowUnit) => {
  const all = ["egg-cash-flow", unit] as const;
  return {
    all,
    settings: () => [...all, "settings"] as const,
    summary: (from: string, to: string) =>
      [...all, "summary", { from, to }] as const,
    movements: (from: string, to: string) =>
      [...all, "movements", { from, to }] as const,
    tripSuggestions: (from: string, to: string) =>
      [...all, "trip-suggestions", { from, to }] as const,
    collectionSuggestions: (from: string, to: string) =>
      [...all, "collection-suggestions", { from, to }] as const,
    remesas: () => [...all, "remesas"] as const,
    availableExpenses: (from: string, to: string) =>
      [...all, "available-expenses", { from, to }] as const,
    cuts: () => [...all, "cuts"] as const,
  };
};
