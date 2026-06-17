import type { DailySalesDTO } from "../api/salesReports.api";

export type WeekdayKey = "L" | "M" | "X" | "J" | "V" | "S" | "D";

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  L: "Lun",
  M: "Mar",
  X: "Mié",
  J: "Jue",
  V: "Vie",
  S: "Sáb",
  D: "Dom",
};

export const WEEKDAY_LABELS_LONG: Record<WeekdayKey, string> = {
  L: "Lunes",
  M: "Martes",
  X: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
  D: "Domingo",
};

export const WEEKDAY_ORDER: WeekdayKey[] = ["L", "M", "X", "J", "V", "S", "D"];

export interface WeekdayTicketsRow {
  key: WeekdayKey;
  label: string;
  labelLong: string;
  tickets: number;
  days: number;
  avg: number;
}

const toWeekdayKey = (date: Date): WeekdayKey => {
  const day = date.getDay();
  const order = [6, 0, 1, 2, 3, 4, 5];
  return WEEKDAY_ORDER[order[day]];
};

export const ticketsByWeekday = (
  dailySales: DailySalesDTO[],
  ticketSource: (entry: DailySalesDTO) => number = (entry) =>
    entry.totalTickets ?? 0,
): WeekdayTicketsRow[] => {
  const acc: Record<
    WeekdayKey,
    { tickets: number; days: number }
  > = {
    L: { tickets: 0, days: 0 },
    M: { tickets: 0, days: 0 },
    X: { tickets: 0, days: 0 },
    J: { tickets: 0, days: 0 },
    V: { tickets: 0, days: 0 },
    S: { tickets: 0, days: 0 },
    D: { tickets: 0, days: 0 },
  };

  for (const entry of dailySales) {
    if (!entry?.day) continue;
    const date = new Date(`${entry.day}T00:00:00`);
    if (Number.isNaN(date.getTime())) continue;
    const key = toWeekdayKey(date);
    acc[key].tickets += ticketSource(entry);
    acc[key].days += 1;
  }

  return WEEKDAY_ORDER.map((key) => {
    const bucket = acc[key];
    const avg = bucket.days > 0 ? bucket.tickets / bucket.days : 0;
    return {
      key,
      label: WEEKDAY_LABELS[key],
      labelLong: WEEKDAY_LABELS_LONG[key],
      tickets: bucket.tickets,
      days: bucket.days,
      avg,
    };
  });
};

export const peakWeekday = (
  rows: WeekdayTicketsRow[],
  minSamples = 1,
): WeekdayTicketsRow | null => {
  const eligible = rows.filter((row) => row.days >= minSamples && row.avg > 0);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, current) =>
    current.avg > best.avg ? current : best,
  );
};
