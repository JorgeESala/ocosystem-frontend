import { describe, expect, it } from "vitest";
import type { BranchSalesSummaryDTO } from "../api/consolidatedSales.api";
import {
  buildRankingRows,
  deltaPct,
  expectedReportDays,
} from "../utils/consolidatedMetrics";

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
  mermaValue: 0,
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
});
