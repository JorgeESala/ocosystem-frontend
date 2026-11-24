import type { BranchSalesSummaryDTO } from "../api/consolidatedSales.api";
import type { BranchExpectedSalesDTO } from "../api/expectedSales.api";
import { isBelowMinimum } from "./expectedSales";

export interface BranchRankingRow extends BranchSalesSummaryDTO {
  share: number;
  salesDelta: number | null;
  missingDays: number;
  expectedKg: number | null;
  expectedReportedKg: number | null;
  expectedVariancePct: number | null;
  expectedLoaded: boolean;
  salesWithoutWeight: number;
  salesWithoutReportedKg: number;
  expectedMoney: number | null;
  expectedReportedMoney: number | null;
  expectedTotalReportedMoney: number | null;
  expectedMoneyDifference: number | null;
  expectedEffectivePrice: number | null;
  expectedComparableDays: number;
  expectedSalesWithZeroMoney: number;
  referenceProductBarcode: string | null;
  referencePriceMissing: boolean;
}

export const REVIEW_VARIANCE_THRESHOLD_PCT = 10;

export const deltaPct = (
  current: number,
  previous: number | null | undefined,
): number | null => {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

export const expectedReportDays = (
  start: Date,
  end: Date,
  now: Date = new Date(),
): number => {
  const first = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const effectiveEnd = last > today ? today : last;
  if (effectiveEnd < first) return 0;
  return Math.round((effectiveEnd.getTime() - first.getTime()) / 86400000) + 1;
};

export const buildRankingRows = (
  branchSummary: BranchSalesSummaryDTO[],
  previousBranchSummary: BranchSalesSummaryDTO[],
  expectedDays: number,
  expectedBranches?: BranchExpectedSalesDTO[],
): BranchRankingRow[] => {
  const previousById = new Map(
    previousBranchSummary.map((branch) => [branch.branchId, branch]),
  );
  const expectedById = new Map(
    (expectedBranches ?? []).map((branch) => [branch.branchId, branch]),
  );
  const totalSales = branchSummary.reduce(
    (acc, branch) => acc + branch.totalSales,
    0,
  );

  return branchSummary
    .map((branch) => {
      const expected = expectedById.get(branch.branchId);
      return {
        ...branch,
        share: totalSales > 0 ? (branch.totalSales / totalSales) * 100 : 0,
        salesDelta: deltaPct(
          branch.totalSales,
          previousById.get(branch.branchId)?.totalSales,
        ),
        missingDays: Math.max(0, expectedDays - branch.daysWithReport),
        expectedKg: expected?.expectedKg ?? null,
        expectedReportedKg: expected?.reportedKg ?? null,
        expectedVariancePct: expected?.variancePct ?? null,
        expectedLoaded: expectedBranches !== undefined,
        salesWithoutWeight: expected?.salesWithoutWeight ?? 0,
        salesWithoutReportedKg: expected?.salesWithoutReportedKg ?? 0,
        expectedMoney: expected?.expectedMoney ?? null,
        expectedReportedMoney: expected?.comparableReportedMoney ?? null,
        expectedTotalReportedMoney: expected?.reportedMoney ?? null,
        expectedMoneyDifference: expected?.moneyDifference ?? null,
        expectedEffectivePrice: expected?.effectivePricePerKg ?? null,
        expectedComparableDays: expected?.comparableDays ?? 0,
        expectedSalesWithZeroMoney: expected?.salesWithZeroMoney ?? 0,
        referenceProductBarcode: expected?.referenceProductBarcode ?? null,
        referencePriceMissing: (expected?.priceMissingDays ?? 0) > 0,
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);
};

export const reviewReasons = (row: BranchRankingRow): string[] => {
  const reasons: string[] = [];

  if (
    row.expectedVariancePct != null &&
    Math.abs(row.expectedVariancePct) >= REVIEW_VARIANCE_THRESHOLD_PCT
  ) {
    reasons.push(
      `Desviación de ${Math.abs(row.expectedVariancePct).toFixed(1)}% contra lo esperado.`,
    );
  }

  if (row.missingDays > 0) {
    reasons.push(
      `${row.missingDays} ${row.missingDays === 1 ? "día" : "días"} sin reporte.`,
    );
  }

  if (
    row.expectedLoaded &&
    row.expectedKg == null &&
    (row.totalSales > 0 || row.expectedReportedKg != null)
  ) {
    reasons.push("Sin kilos esperados para comparar.");
  }

  const excludedSales =
    (row.salesWithoutWeight ?? 0) + (row.salesWithoutReportedKg ?? 0);
  if (excludedSales > 0) {
    reasons.push(
      `${excludedSales} ${
        excludedSales === 1 ? "venta excluida" : "ventas excluidas"
      } del cálculo.`,
    );
  }

  if (row.expectedLoaded) {
    if (row.expectedKg != null && !row.referenceProductBarcode) {
      reasons.push("Sin producto de referencia de pollo.");
    } else if (row.expectedKg != null && row.referencePriceMissing) {
      reasons.push(
        row.expectedMoney == null
          ? "Sin precio de referencia."
          : "Sin precio de referencia para algunos días.",
      );
    }

    if (isBelowMinimum(row.expectedMoney, row.expectedReportedMoney)) {
      reasons.push("Venta registrada por debajo del mínimo.");
    }
  }

  return reasons;
};

export const needsReview = (row: BranchRankingRow): boolean =>
  reviewReasons(row).length > 0;
