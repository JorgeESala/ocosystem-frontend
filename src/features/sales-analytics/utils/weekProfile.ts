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
  missingToday: boolean;
  missingPrevDays: number;
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

export function filterDrawableProfiles(
  profiles: WeekProfile[],
  dailySales: DailySalesDTO[],
  weeks: number,
): WeekProfile[] {
  if (profiles.length === 0 || dailySales.length === 0) return [];

  const rangeStart = dailySales[0].date;
  const rangeEnd = dailySales[dailySales.length - 1].date;
  const currentWeekStart = weekStartOf(rangeEnd);

  const kept = profiles.filter((p) => {
    if (p.weekStart === currentWeekStart) return true;
    const weekEnd = addDays(p.weekStart, 6);
    return p.weekStart >= rangeStart && weekEnd <= rangeEnd;
  });

  const byBranch = new Map<string, WeekProfile[]>();
  for (const p of kept) {
    const list = byBranch.get(p.branch) ?? [];
    list.push(p);
    byBranch.set(p.branch, list);
  }

  const result: WeekProfile[] = [];
  for (const [, list] of byBranch) {
    list.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    result.push(...list.slice(-weeks));
  }
  return result;
}

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

  const branchNames = new Set<string>();
  for (const sale of dailySales) {
    for (const name of Object.keys(getQty(sale))) {
      branchNames.add(name);
    }
  }

  const result: WeekTotals[] = [];
  for (const name of branchNames) {
    const dataDays = windowDates.filter(
      (d) => byDate.get(d)?.[name] !== undefined,
    );
    const prevDays = dataDays.map((d) => addDays(d, -7));
    const prevCovered = prevDays.every((d) => d >= rangeStart);

    const currentWeek = dataDays.reduce(
      (sum, d) => sum + (byDate.get(d)?.[name] ?? 0),
      0,
    );
    const missingToday = byDate.get(rangeEnd)?.[name] === undefined;

    let previousWeek = 0;
    let missingPrevDays = 0;
    for (const d of prevDays) {
      if (byDate.get(d)?.[name] === undefined) {
        missingPrevDays += 1;
      }
      previousWeek += byDate.get(d)?.[name] ?? 0;
    }
    if (!prevCovered) {
      previousWeek = 0;
      missingPrevDays = prevDays.length;
    }

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
      currentPartial: dataDays.length < 7,
      windowDays: dataDays.length,
      missingToday,
      missingPrevDays,
    });
  }
  return result;
}
