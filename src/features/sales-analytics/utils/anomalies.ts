import type { DailySalesDTO } from "../types";

export interface BaselineInfo {
  expected: number;
  samples: number;
}

export interface Anomaly {
  branch: string;
  date: string;
  weekday: number;
  actual: number;
  expected: number;
  deviationPct: number;
  direction: "spike" | "dip";
}

export interface AnomalySeriesPoint {
  date: string;
  label: string;
  [key: string]: string | number | null;
}

export interface AnomalyAnalysis {
  anomalies: Anomaly[];
  series: AnomalySeriesPoint[];
  analyzedDays: number;
}

export interface AnomalyOptions {
  thresholdPct?: number;
  minSamples?: number;
}

const weekdayOf = (date: string): number =>
  new Date(date + "T00:00:00").getDay();

const formatLabel = (date: string): string =>
  new Date(date + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
};

export function computeBaseline(
  dailySales: DailySalesDTO[],
  getQty: (d: DailySalesDTO) => Record<string, number>,
): Map<string, Map<number, BaselineInfo>> {
  const totals = new Map<string, Map<number, number[]>>();

  for (const sale of dailySales) {
    const qty = getQty(sale);
    const weekday = weekdayOf(sale.date);
    for (const [branch, value] of Object.entries(qty)) {
      const byWeekday = totals.get(branch) ?? new Map();
      const values = byWeekday.get(weekday) ?? [];
      values.push(value);
      byWeekday.set(weekday, values);
      totals.set(branch, byWeekday);
    }
  }

  const result = new Map<string, Map<number, BaselineInfo>>();
  for (const [branch, byWeekday] of totals) {
    const info = new Map<number, BaselineInfo>();
    for (const [weekday, values] of byWeekday) {
      info.set(weekday, { expected: median(values), samples: values.length });
    }
    result.set(branch, info);
  }
  return result;
}

export function analyzeSalesAnomalies(
  dailySales: DailySalesDTO[],
  getQty: (d: DailySalesDTO) => Record<string, number>,
  options: AnomalyOptions = {},
): AnomalyAnalysis {
  const thresholdPct = options.thresholdPct ?? 30;
  const minSamples = options.minSamples ?? 3;

  const byBranchWeekday = new Map<
    string,
    Map<number, Array<{ date: string; value: number }>>
  >();

  for (const sale of dailySales) {
    const qty = getQty(sale);
    const weekday = weekdayOf(sale.date);
    for (const [branch, value] of Object.entries(qty)) {
      const byWeekday = byBranchWeekday.get(branch) ?? new Map();
      const entries = byWeekday.get(weekday) ?? [];
      entries.push({ date: sale.date, value });
      byWeekday.set(weekday, entries);
      byBranchWeekday.set(branch, byWeekday);
    }
  }

  const anomalies: Anomaly[] = [];
  let analyzedDays = 0;

  for (const sale of dailySales) {
    const qty = getQty(sale);
    const weekday = weekdayOf(sale.date);
    let dayAnalyzed = false;

    for (const [branch, value] of Object.entries(qty)) {
      const entries = byBranchWeekday.get(branch)?.get(weekday) ?? [];
      const others = entries.filter((e) => e.date !== sale.date);
      if (others.length < minSamples) continue;

      const expected = median(others.map((e) => e.value));
      if (expected === 0) continue;

      dayAnalyzed = true;
      const rawDeviation = ((value - expected) / expected) * 100;
      const deviationPct = Math.round(rawDeviation * 10) / 10;
      if (Math.abs(deviationPct) >= thresholdPct) {
        anomalies.push({
          branch,
          date: sale.date,
          weekday,
          actual: value,
          expected,
          deviationPct,
          direction: deviationPct > 0 ? "spike" : "dip",
        });
      }
    }

    if (dayAnalyzed) {
      analyzedDays += 1;
    }
  }

  const series: AnomalySeriesPoint[] = dailySales.map((sale) => {
    const qty = getQty(sale);
    const point: AnomalySeriesPoint = {
      date: sale.date,
      label: formatLabel(sale.date),
    };
    for (const [branch, value] of Object.entries(qty)) {
      point[branch] = value;
      const entries =
        byBranchWeekday.get(branch)?.get(weekdayOf(sale.date)) ?? [];
      const others = entries.filter((e) => e.date !== sale.date);
      if (others.length < minSamples) {
        point[`${branch}.exp`] = null;
        point[`${branch}.hi`] = null;
        point[`${branch}.lo`] = null;
        continue;
      }
      const expected = median(others.map((e) => e.value));
      if (expected === 0) {
        point[`${branch}.exp`] = null;
        point[`${branch}.hi`] = null;
        point[`${branch}.lo`] = null;
        continue;
      }
      point[`${branch}.exp`] = expected;
      point[`${branch}.hi`] = expected * (1 + thresholdPct / 100);
      point[`${branch}.lo`] = expected * (1 - thresholdPct / 100);
    }
    return point;
  });

  anomalies.sort((a, b) => Math.abs(b.deviationPct) - Math.abs(a.deviationPct));

  return { anomalies, series, analyzedDays };
}
