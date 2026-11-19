import type { BranchSalesSummaryDTO } from "../api/consolidatedSales.api";
import type { BranchExpectedSalesDTO } from "../api/expectedSales.api";

export interface BranchRankingRow extends BranchSalesSummaryDTO {
  share: number;
  salesDelta: number | null;
  missingDays: number;
  expectedKg: number | null;
  expectedReportedKg: number | null;
  expectedVariancePct: number | null;
}

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
  expectedBranches: BranchExpectedSalesDTO[] = [],
): BranchRankingRow[] => {
  const previousById = new Map(
    previousBranchSummary.map((branch) => [branch.branchId, branch]),
  );
  const expectedById = new Map(
    expectedBranches.map((branch) => [branch.branchId, branch]),
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
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);
};
