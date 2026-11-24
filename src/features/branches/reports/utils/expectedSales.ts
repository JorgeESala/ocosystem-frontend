import type { DailyExpectedSalesDTO } from "../api/expectedSales.api";
import { formatFullDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";

export interface DailyExpectedSalesRow {
  day: string;
  expectedKg: number | null;
  reportedKg: number | null;
  differenceKg: number | null;
  variancePct: number | null;
  birdsSold: number;
  avgChickenWeight: number | null;
  salesWithoutWeight: number;
  referencePricePerKg: number | null;
  priceAsOf: string | null;
  reportedMoney: number | null;
  comparableReportedMoney: number | null;
  expectedMoney: number | null;
  moneyDifference: number | null;
  salesWithZeroMoney: number;
  salesWithoutReportedMoney: number;
}

export const MONEY_REVIEW_TOLERANCE_PCT = 0.5;

export const expectedVariancePct = (
  expectedKg: number | null,
  reportedKg: number | null,
): number | null => {
  if (expectedKg == null || reportedKg == null || expectedKg <= 0) {
    return null;
  }
  return ((reportedKg - expectedKg) / expectedKg) * 100;
};

export type MoneyComparisonState = "below" | "within" | "above" | null;

export const moneyComparisonState = (
  expectedMoney: number | null | undefined,
  reportedMoney: number | null | undefined,
): MoneyComparisonState => {
  if (expectedMoney == null || reportedMoney == null) return null;
  const tolerance = Math.max(
    0.01,
    expectedMoney * (MONEY_REVIEW_TOLERANCE_PCT / 100),
  );
  const difference = reportedMoney - expectedMoney;
  if (difference < -tolerance) return "below";
  if (difference > tolerance) return "above";
  return "within";
};

export const isBelowMinimum = (
  expectedMoney: number | null | undefined,
  reportedMoney: number | null | undefined,
): boolean => moneyComparisonState(expectedMoney, reportedMoney) === "below";

export const isKgUnitName = (value: string | null | undefined): boolean => {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized === "kg" || normalized.startsWith("kilo");
};

export const aggregateExpectedDaily = (
  daily: DailyExpectedSalesDTO[],
): DailyExpectedSalesRow[] => {
  const byDay = new Map<
    string,
    {
      expectedKg: number | null;
      reportedKg: number | null;
      birdsSold: number;
      weightedKg: number;
      weightedBirds: number;
      salesWithoutWeight: number;
      pricedExpectedKg: number;
      reportedMoney: number | null;
      comparableReportedMoney: number | null;
      expectedMoney: number | null;
      moneyDifference: number | null;
      salesWithZeroMoney: number;
      salesWithoutReportedMoney: number;
      priceDates: Set<string>;
    }
  >();

  for (const row of daily) {
    const current = byDay.get(row.day) ?? {
      expectedKg: null,
      reportedKg: null,
      birdsSold: 0,
      weightedKg: 0,
      weightedBirds: 0,
      salesWithoutWeight: 0,
      pricedExpectedKg: 0,
      reportedMoney: null,
      comparableReportedMoney: null,
      expectedMoney: null,
      moneyDifference: null,
      salesWithZeroMoney: 0,
      salesWithoutReportedMoney: 0,
      priceDates: new Set<string>(),
    };

    if (row.expectedKg != null) {
      current.expectedKg = (current.expectedKg ?? 0) + row.expectedKg;
    }
    if (row.reportedKg != null) {
      current.reportedKg = (current.reportedKg ?? 0) + row.reportedKg;
    }
    current.birdsSold += row.birdsSold ?? 0;
    if (row.avgChickenWeight != null && (row.birdsSold ?? 0) > 0) {
      current.weightedKg += row.avgChickenWeight * row.birdsSold;
      current.weightedBirds += row.birdsSold;
    }
    current.salesWithoutWeight += row.salesWithoutWeight ?? 0;
    current.salesWithZeroMoney += row.salesWithZeroMoney ?? 0;
    current.salesWithoutReportedMoney += row.salesWithoutReportedMoney ?? 0;

    if (row.reportedMoney != null) {
      current.reportedMoney = (current.reportedMoney ?? 0) + row.reportedMoney;
    }
    if (row.expectedMoney != null && row.expectedKg != null) {
      current.expectedMoney = (current.expectedMoney ?? 0) + row.expectedMoney;
      current.pricedExpectedKg += row.expectedKg;
    }
    if (row.comparableReportedMoney != null) {
      current.comparableReportedMoney =
        (current.comparableReportedMoney ?? 0) + row.comparableReportedMoney;
    }
    if (row.moneyDifference != null) {
      current.moneyDifference =
        (current.moneyDifference ?? 0) + row.moneyDifference;
    }
    if (row.priceAsOf) {
      current.priceDates.add(row.priceAsOf);
    }

    byDay.set(row.day, current);
  }

  return Array.from(byDay.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([day, value]) => ({
      day,
      expectedKg: value.expectedKg,
      reportedKg: value.reportedKg,
      differenceKg:
        value.expectedKg != null && value.reportedKg != null
          ? value.reportedKg - value.expectedKg
          : null,
      variancePct: expectedVariancePct(value.expectedKg, value.reportedKg),
      birdsSold: value.birdsSold,
      avgChickenWeight:
        value.weightedBirds > 0 ? value.weightedKg / value.weightedBirds : null,
      salesWithoutWeight: value.salesWithoutWeight,
      referencePricePerKg:
        value.expectedMoney != null && value.pricedExpectedKg > 0
          ? value.expectedMoney / value.pricedExpectedKg
          : null,
      priceAsOf:
        value.priceDates.size === 1 ? Array.from(value.priceDates)[0] : null,
      reportedMoney: value.reportedMoney,
      comparableReportedMoney: value.comparableReportedMoney,
      expectedMoney: value.expectedMoney,
      moneyDifference: value.moneyDifference,
      salesWithZeroMoney: value.salesWithZeroMoney,
      salesWithoutReportedMoney: value.salesWithoutReportedMoney,
    }));
};

const kgFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 2,
});

const birdsFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const weightFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 3,
});

export const formatKg = (value: number | null | undefined): string =>
  value == null ? "—" : `${kgFormatter.format(value)} kg`;

export const formatKgValue = (value: number | null | undefined): string =>
  value == null ? "—" : kgFormatter.format(value);

export const formatBirds = (value: number | null | undefined): string =>
  value == null ? "—" : birdsFormatter.format(value);

export const formatChickenWeight = (
  value: number | null | undefined,
): string => (value == null ? "—" : `${weightFormatter.format(value)} kg`);

export const formatVariance = (value: number | null | undefined): string => {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

export const formatMoney = (value: number | null | undefined): string =>
  value == null ? "—" : formatMXN(value);

export const formatPricePerKg = (value: number | null | undefined): string =>
  value == null ? "—" : `${formatMXN(value)} / kg`;

export const formatExpectedTooltipLabel = (value: unknown): string =>
  formatFullDate(String(value));

export const formatExpectedTooltipValue = (
  value: number,
  name: string,
): [string, string] => [formatKg(value), name];

export const formatExpectedMoneyTooltipValue = (
  value: number,
  name: string,
): [string, string] => [formatMXN(value), name];
