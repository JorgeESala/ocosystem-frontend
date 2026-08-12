import type { DailySalesDTO } from "../types";

export interface WeekProfile {
  branch: string;
  weekStart: string;
  weekLabel: string;
  days: Record<number, number | null>;
}

export interface WeekTotals {
  branch: string;
  currentWeek: number;
  previousWeek: number;
  changePct: number | null;
  currentPartial: boolean;
  windowDays: number;
}

export interface WeekOptions {
  weeks?: number;
}

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const weekStartOf = (date: string): string => {
  const d = new Date(date + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${dayOfMonth}`;
};

const formatWeekLabel = (weekStart: string): string =>
  new Date(weekStart + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });

export function buildWeekProfiles(
  dailySales: DailySalesDTO[],
  getQty: (d: DailySalesDTO) => Record<string, number>,
  options: WeekOptions = {},
): WeekProfile[] {
  const weeks = options.weeks ?? 4;

  const byBranch = new Map<string, Map<string, Map<number, number>>>();

  for (const sale of dailySales) {
    const qty = getQty(sale);
    const weekStart = weekStartOf(sale.date);
    const weekday = new Date(sale.date + "T00:00:00").getDay();
    for (const [branch, value] of Object.entries(qty)) {
      const byWeek = byBranch.get(branch) ?? new Map();
      const days = byWeek.get(weekStart) ?? new Map();
      days.set(weekday, value);
      byWeek.set(weekStart, days);
      byBranch.set(branch, byWeek);
    }
  }

  const result: WeekProfile[] = [];
  for (const [branch, byWeek] of byBranch) {
    const weekStarts = Array.from(byWeek.keys()).sort().slice(-weeks);
    for (const weekStart of weekStarts) {
      const days = byWeek.get(weekStart)!;
      const profile: WeekProfile = {
        branch,
        weekStart,
        weekLabel: formatWeekLabel(weekStart),
        days: {},
      };
      for (const weekday of WEEKDAY_ORDER) {
        profile.days[weekday] = days.has(weekday)
          ? (days.get(weekday) ?? 0)
          : null;
      }
      result.push(profile);
    }
  }
  return result;
}

const addDays = (date: string, days: number): string => {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + days);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${dayOfMonth}`;
};

export function computeWeekTotals(
  dailySales: DailySalesDTO[],
  getQty: (d: DailySalesDTO) => Record<string, number>,
): WeekTotals[] {
  if (dailySales.length === 0) return [];

  const rangeStart = dailySales[0].date;
  const rangeEnd = dailySales[dailySales.length - 1].date;
  const byDate = new Map(dailySales.map((s) => [s.date, getQty(s)]));

  const currentWeekStart = weekStartOf(rangeEnd);
  const windowDates: string[] = [];
  let cursor = currentWeekStart < rangeStart ? rangeStart : currentWeekStart;
  const weekEnd = addDays(currentWeekStart, 6);
  while (cursor <= rangeEnd && cursor <= weekEnd) {
    windowDates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  const windowDays = windowDates.length;
  const prevWindowDates = windowDates.map((d) => addDays(d, -7));
  const prevCovered = prevWindowDates.every((d) => d >= rangeStart);
  const currentPartial = windowDays < 7;

  const branchNames = new Set<string>();
  for (const sale of dailySales) {
    for (const name of Object.keys(getQty(sale))) {
      branchNames.add(name);
    }
  }

  const sumWindow = (dates: string[]): Map<string, number> => {
    const sums = new Map<string, number>();
    for (const date of dates) {
      const qty = byDate.get(date);
      if (!qty) continue;
      for (const [name, value] of Object.entries(qty)) {
        sums.set(name, (sums.get(name) ?? 0) + value);
      }
    }
    return sums;
  };

  const current = sumWindow(windowDates);
  const previous = prevCovered
    ? sumWindow(prevWindowDates)
    : new Map<string, number>();

  const result: WeekTotals[] = [];
  for (const name of branchNames) {
    const currentWeek = current.get(name) ?? 0;
    const previousWeek = prevCovered ? (previous.get(name) ?? 0) : 0;

    let changePct: number | null = null;
    if (previousWeek > 0) {
      changePct =
        Math.round(((currentWeek - previousWeek) / previousWeek) * 1000) / 10;
    }

    result.push({
      branch: name,
      currentWeek,
      previousWeek,
      changePct,
      currentPartial,
      windowDays,
    });
  }
  return result;
}
