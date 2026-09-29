import type { ProductDailyPointDTO } from "../api/productAnalytics.api";
import {
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  toWeekdayKey,
  type WeekdayKey,
} from "./ticketsByWeekday";

export type AbcClass = "A" | "B" | "C";

export interface WeekdayAverageRow {
  key: WeekdayKey;
  label: string;
  avg: number;
  days: number;
}

export const buildWeekdayAverages = (
  daily: ProductDailyPointDTO[],
): WeekdayAverageRow[] => {
  const acc: Record<WeekdayKey, { quantity: number; days: number }> = {
    L: { quantity: 0, days: 0 },
    M: { quantity: 0, days: 0 },
    X: { quantity: 0, days: 0 },
    J: { quantity: 0, days: 0 },
    V: { quantity: 0, days: 0 },
    S: { quantity: 0, days: 0 },
    D: { quantity: 0, days: 0 },
  };

  for (const point of daily) {
    const date = new Date(`${point.day}T00:00:00`);
    if (Number.isNaN(date.getTime())) continue;
    const key = toWeekdayKey(date);
    acc[key].quantity += point.quantity;
    acc[key].days += 1;
  }

  return WEEKDAY_ORDER.map((key) => ({
    key,
    label: WEEKDAY_LABELS[key],
    avg: acc[key].days > 0 ? acc[key].quantity / acc[key].days : 0,
    days: acc[key].days,
  }));
};

export const heatIntensity = (value: number, max: number): number => {
  if (max <= 0 || value <= 0) return 0;
  return Math.min(1, value / max);
};

export const formatUnits = (value: number): string =>
  value.toLocaleString("es-MX", { maximumFractionDigits: 1 });
