import type {
  BranchExpectedSalesDTO,
  DailyExpectedSalesDTO,
} from "../api/expectedSales.api";

export interface DailyExpectedSalesRow {
  day: string;
  expectedKg: number | null;
  reportedKg: number | null;
  differenceKg: number | null;
  variancePct: number | null;
  birdsSold: number;
  avgChickenWeight: number | null;
  salesWithoutWeight: number;
}

export const expectedVariancePct = (
  expectedKg: number | null,
  reportedKg: number | null,
): number | null => {
  if (expectedKg == null || reportedKg == null || expectedKg <= 0) {
    return null;
  }
  return ((reportedKg - expectedKg) / expectedKg) * 100;
};

export const buildExpectedByBranch = (
  branches: BranchExpectedSalesDTO[],
): Map<number, BranchExpectedSalesDTO> =>
  new Map(branches.map((branch) => [branch.branchId, branch]));

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
