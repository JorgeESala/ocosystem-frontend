import type { UnitCashUnit } from "../types.unit";

export const unitCashKeys = (unit: UnitCashUnit) => {
  const all = ["unit-general-cash", unit] as const;
  return {
    all,
    account: () => [...all, "account"] as const,
    flow: (start: string, end: string, frequency: string) =>
      [...all, "flow", { start, end, frequency }] as const,
    history: (start: string, end: string) =>
      [...all, "history", { start, end }] as const,
    alerts: () => [...all, "alerts"] as const,
    adjustments: (start: string, end: string) =>
      [...all, "adjustments", { start, end }] as const,
    reconciliation: () => [...all, "reconciliation"] as const,
  };
};
