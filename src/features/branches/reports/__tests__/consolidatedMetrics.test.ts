import { describe, expect, it } from "vitest";
import type { BranchSalesSummaryDTO } from "../api/consolidatedSales.api";
import {
  buildRankingRows,
  deltaPct,
  expectedReportDays,
  needsReview,
  reviewReasons,
  REVIEW_VARIANCE_THRESHOLD_PCT,
} from "../utils/consolidatedMetrics";
import type { BranchRankingRow } from "../utils/consolidatedMetrics";

const branch = (
  branchId: number,
  overrides: Partial<BranchSalesSummaryDTO> = {},
): BranchSalesSummaryDTO => ({
  branchId,
  branchName: `Sucursal ${branchId}`,
  totalSales: 0,
  totalTickets: 0,
  realTickets: 0,
  avgTicket: 0,
  totalSlaughtered: 0,
  mermaQuantity: 0,
  totalChickenTickets: 0,
  ticketsWithComplements: 0,
  attachRate: 0,
  daysWithReport: 0,
  ...overrides,
});

describe("deltaPct", () => {
  it("computes the percentage change", () => {
    expect(deltaPct(120, 100)).toBeCloseTo(20);
    expect(deltaPct(80, 100)).toBeCloseTo(-20);
  });

  it("returns null without a usable baseline", () => {
    expect(deltaPct(100, null)).toBeNull();
    expect(deltaPct(100, undefined)).toBeNull();
    expect(deltaPct(100, 0)).toBeNull();
  });
});

describe("expectedReportDays", () => {
  it("counts every calendar day in a past range", () => {
    const start = new Date(2026, 5, 1);
    const end = new Date(2026, 5, 7);
    expect(expectedReportDays(start, end, new Date(2026, 6, 1))).toBe(7);
  });

  it("clamps the range to today when the end date is in the future", () => {
    const start = new Date(2026, 5, 1);
    const end = new Date(2026, 5, 30);
    expect(expectedReportDays(start, end, new Date(2026, 5, 10))).toBe(10);
  });

  it("returns zero when the range starts after today", () => {
    const start = new Date(2026, 6, 1);
    const end = new Date(2026, 6, 7);
    expect(expectedReportDays(start, end, new Date(2026, 5, 30))).toBe(0);
  });
});

describe("buildRankingRows", () => {
  const current = [
    branch(1, { totalSales: 300, daysWithReport: 7 }),
    branch(2, { totalSales: 700, daysWithReport: 5 }),
  ];
  const previous = [
    branch(1, { totalSales: 250 }),
    branch(2, { totalSales: 700 }),
  ];

  it("sorts by sales, computes share and missing days", () => {
    const rows = buildRankingRows(current, previous, 7);

    expect(rows.map((row) => row.branchId)).toEqual([2, 1]);
    expect(rows[0].share).toBeCloseTo(70);
    expect(rows[1].share).toBeCloseTo(30);
    expect(rows[1].missingDays).toBe(0);
    expect(rows[0].missingDays).toBe(2);
  });

  it("matches the previous period per branch", () => {
    const rows = buildRankingRows(current, previous, 7);

    const branchOne = rows.find((row) => row.branchId === 1);
    const branchTwo = rows.find((row) => row.branchId === 2);

    expect(branchOne?.salesDelta).toBeCloseTo(20);
    expect(branchTwo?.salesDelta).toBeCloseTo(0);
  });

  it("returns null deltas when there is no previous period", () => {
    const rows = buildRankingRows(current, [], 7);
    expect(rows.every((row) => row.salesDelta === null)).toBe(true);
  });

  it("returns zero share when there are no sales", () => {
    const rows = buildRankingRows([branch(1)], [], 7);
    expect(rows[0].share).toBe(0);
  });

  it("merges expected sales by branch", () => {
    const rows = buildRankingRows(current, previous, 7, [
      {
        branchId: 1,
        branchName: "Sucursal 1",
        expectedKg: 120,
        reportedKg: 100,
        differenceKg: -20,
        variancePct: -16.67,
        birdsSold: 80,
        avgChickenWeight: 1.75,
        salesCount: 2,
        salesWithoutWeight: 0,
        salesWithoutReportedKg: 0,
        daysWithData: 2,
        referenceProductBarcode: "REF",
        referenceProductName: "Pollo entero",
        referencePricePerKg: 50,
        priceAsOf: "2026-06-01",
        expectedMoney: 6000,
        reportedMoney: 6000,
        comparableReportedMoney: 5500,
        moneyDifference: -500,
        effectivePricePerKg: 50,
        comparableDays: 2,
        salesWithZeroMoney: 0,
        priceMissingDays: 0,
      },
    ]);

    const branchOne = rows.find((row) => row.branchId === 1);
    const branchTwo = rows.find((row) => row.branchId === 2);

    expect(branchOne?.expectedKg).toBe(120);
    expect(branchOne?.expectedReportedKg).toBe(100);
    expect(branchOne?.expectedVariancePct).toBeCloseTo(-16.67);
    expect(branchOne?.expectedReportedMoney).toBe(5500);
    expect(branchOne?.expectedTotalReportedMoney).toBe(6000);
    expect(branchOne?.expectedEffectivePrice).toBe(50);
    expect(branchOne?.expectedComparableDays).toBe(2);
    expect(branchTwo?.expectedKg).toBeNull();
    expect(branchTwo?.expectedReportedMoney).toBeNull();
    expect(branchTwo?.expectedTotalReportedMoney).toBeNull();
  });

  it("marks expected data as not loaded when the report is missing", () => {
    const rows = buildRankingRows(
      [branch(1, { totalSales: 300, daysWithReport: 7 })],
      [],
      7,
    );

    expect(rows[0].expectedLoaded).toBe(false);
    expect(reviewReasons(rows[0])).toEqual([]);
  });

  it("maps the excluded-sales counters into the ranking row", () => {
    const rows = buildRankingRows(current, previous, 7, [
      {
        branchId: 1,
        branchName: "Sucursal 1",
        expectedKg: 100,
        reportedKg: 90,
        differenceKg: -10,
        variancePct: -10,
        birdsSold: 50,
        avgChickenWeight: 1.8,
        salesCount: 1,
        salesWithoutWeight: 2,
        salesWithoutReportedKg: 3,
        daysWithData: 1,
        referenceProductBarcode: "REF",
        referenceProductName: "Pollo entero",
        referencePricePerKg: 50,
        priceAsOf: "2026-06-01",
        expectedMoney: 5000,
        reportedMoney: 5000,
        comparableReportedMoney: 4500,
        moneyDifference: -500,
        effectivePricePerKg: 50,
        comparableDays: 1,
        salesWithZeroMoney: 0,
        priceMissingDays: 0,
      },
    ]);

    const branchOne = rows.find((row) => row.branchId === 1);
    expect(branchOne?.salesWithoutWeight).toBe(2);
    expect(branchOne?.salesWithoutReportedKg).toBe(3);
  });
});

describe("needsReview", () => {
  const rankingRow = (
    overrides: Partial<BranchRankingRow> = {},
  ): BranchRankingRow => ({
    ...branch(1, { totalSales: 1000 }),
    share: 100,
    salesDelta: null,
    missingDays: 0,
    expectedKg: 1000,
    expectedReportedKg: 1000,
    expectedVariancePct: 0,
    expectedLoaded: true,
    salesWithoutWeight: 0,
    salesWithoutReportedKg: 0,
    expectedMoney: 1000,
    expectedReportedMoney: 1000,
    expectedTotalReportedMoney: 1000,
    expectedMoneyDifference: 0,
    expectedEffectivePrice: 50,
    expectedComparableDays: 7,
    expectedSalesWithZeroMoney: 0,
    referenceProductBarcode: "REF",
    referencePriceMissing: false,
    ...overrides,
  });

  it("does not flag a healthy branch", () => {
    expect(needsReview(rankingRow({ expectedVariancePct: 4 }))).toBe(false);
    expect(reviewReasons(rankingRow({ expectedVariancePct: 4 }))).toEqual([]);
  });

  it("flags a deviation at the threshold", () => {
    const row = rankingRow({
      expectedVariancePct: REVIEW_VARIANCE_THRESHOLD_PCT,
    });

    expect(needsReview(row)).toBe(true);
    expect(reviewReasons(row)).toContain(
      "Desviación de 10.0% contra lo esperado.",
    );
  });

  it("flags missing report days", () => {
    const row = rankingRow({ missingDays: 3, daysWithReport: 4 });

    expect(needsReview(row)).toBe(true);
    expect(reviewReasons(row)).toContain("3 días sin reporte.");
  });

  it("uses the singular for one missing report day", () => {
    const row = rankingRow({ missingDays: 1, daysWithReport: 6 });

    expect(reviewReasons(row)).toContain("1 día sin reporte.");
  });

  it("does not flag a branch with no expected kilos and no activity", () => {
    const row = rankingRow({
      expectedKg: null,
      expectedReportedKg: null,
      expectedVariancePct: null,
      totalSales: 0,
    });

    expect(needsReview(row)).toBe(false);
  });

  it("does not flag missing expected kilos before the data loads", () => {
    const row = rankingRow({
      expectedKg: null,
      expectedReportedKg: null,
      expectedVariancePct: null,
      expectedLoaded: false,
      totalSales: 500,
    });

    expect(needsReview(row)).toBe(false);
    expect(reviewReasons(row)).toEqual([]);
  });

  it("flags a branch with no expected kilos but activity", () => {
    const row = rankingRow({
      expectedKg: null,
      expectedReportedKg: null,
      expectedVariancePct: null,
      totalSales: 500,
    });

    expect(needsReview(row)).toBe(true);
    expect(reviewReasons(row)).toContain("Sin kilos esperados para comparar.");
  });

  it("flags excluded sales and counts both exclusion reasons", () => {
    const row = rankingRow({
      salesWithoutWeight: 1,
      salesWithoutReportedKg: 2,
    });

    expect(needsReview(row)).toBe(true);
    expect(reviewReasons(row)).toContain("3 ventas excluidas del cálculo.");
  });

  it("uses the singular for one excluded sale", () => {
    const row = rankingRow({ salesWithoutReportedKg: 1 });

    expect(reviewReasons(row)).toContain("1 venta excluida del cálculo.");
  });

  it("treats missing exclusion counters as zero", () => {
    const row = rankingRow({
      salesWithoutWeight: undefined as unknown as number,
      salesWithoutReportedKg: undefined as unknown as number,
    });

    expect(needsReview(row)).toBe(false);
  });

  it("flags a branch without a reference product", () => {
    const row = rankingRow({
      referenceProductBarcode: null,
      expectedMoney: null,
      expectedReportedMoney: null,
      expectedMoneyDifference: null,
      referencePriceMissing: true,
    });

    expect(needsReview(row)).toBe(true);
    expect(reviewReasons(row)).toContain(
      "Sin producto de referencia de pollo.",
    );
  });

  it("flags a branch without a reference price", () => {
    const row = rankingRow({
      expectedMoney: null,
      expectedReportedMoney: null,
      expectedMoneyDifference: null,
      referencePriceMissing: true,
    });

    expect(needsReview(row)).toBe(true);
    expect(reviewReasons(row)).toContain("Sin precio de referencia.");
  });

  it("flags some days without a reference price", () => {
    const row = rankingRow({ referencePriceMissing: true });

    expect(reviewReasons(row)).toContain(
      "Sin precio de referencia para algunos días.",
    );
  });

  it("flags a sale below the money minimum", () => {
    const row = rankingRow({
      expectedMoney: 1000,
      expectedReportedMoney: 900,
      expectedMoneyDifference: -100,
    });

    expect(needsReview(row)).toBe(true);
    expect(reviewReasons(row)).toContain(
      "Venta registrada por debajo del mínimo.",
    );
  });

  it("does not flag money within the tolerance", () => {
    const row = rankingRow({
      expectedMoney: 1000,
      expectedReportedMoney: 996,
      expectedMoneyDifference: -4,
    });

    expect(needsReview(row)).toBe(false);
    expect(reviewReasons(row)).toEqual([]);
  });

  it("does not flag money reasons before expected data loads", () => {
    const row = rankingRow({
      expectedLoaded: false,
      expectedMoney: null,
      expectedReportedMoney: null,
      expectedMoneyDifference: null,
      referenceProductBarcode: null,
      referencePriceMissing: true,
    });

    expect(needsReview(row)).toBe(false);
  });
});
