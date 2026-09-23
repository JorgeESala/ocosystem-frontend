import { toLocalDateString } from "@/utils/date.utils";
import type { ComparisonMode } from "@/core/api/types";

export interface ComparisonDateRange {
  from: string;
  to: string;
}

const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const minusMonths = (date: Date, months: number): Date => {
  const targetMonth = date.getMonth() - months;
  const lastDayOfTargetMonth = new Date(
    date.getFullYear(),
    targetMonth + 1,
    0,
  ).getDate();
  return new Date(
    date.getFullYear(),
    targetMonth,
    Math.min(date.getDate(), lastDayOfTargetMonth),
  );
};

export const previousRangeFor = (
  from: string,
  to: string,
  mode: ComparisonMode,
): ComparisonDateRange => {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  if (mode === "PREVIOUS_MONTH") {
    return {
      from: toLocalDateString(minusMonths(start, 1)),
      to: toLocalDateString(minusMonths(end, 1)),
    };
  }

  const rangeDays =
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const previousTo = addDays(start, -1);
  return {
    from: toLocalDateString(addDays(previousTo, -(rangeDays - 1))),
    to: toLocalDateString(previousTo),
  };
};
