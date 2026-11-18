import { describe, expect, it } from "vitest";
import { buildBranchExpenseReportCsv } from "../utils/report-csv";
import type { BranchExpenseAnalyticsResponse } from "../types";

const data: BranchExpenseAnalyticsResponse = {
  current: { totalAmount: 350, expenseCount: 2, averageAmount: 175 },
  previous: { totalAmount: 300, expenseCount: 2, averageAmount: 150 },
  amountDifference: 50,
  amountVariationPct: 16.67,
  countDifference: 0,
  countVariationPct: 0,
  buckets: [],
  categories: [
    {
      id: 10,
      code: "COSTO_VENTAS",
      name: "Costo de ventas",
      parentId: null,
      parentName: null,
      reportGroup: "COSTO",
      currentAmount: 350,
      currentCount: 2,
      previousAmount: 300,
      previousCount: 2,
      amountDifference: 50,
      amountVariationPct: 16.67,
      countDifference: 0,
      countVariationPct: 0,
      children: [
        {
          id: 11,
          code: "GAS_LP",
          name: 'Gas "LP"',
          parentId: 10,
          parentName: "Costo de ventas",
          reportGroup: "COSTO",
          currentAmount: 350,
          currentCount: 2,
          previousAmount: 300,
          previousCount: 2,
          amountDifference: 50,
          amountVariationPct: 16.67,
          countDifference: 0,
          countVariationPct: 0,
          children: [],
        },
      ],
    },
  ],
  branches: [
    {
      id: 1,
      name: "Centro",
      currentAmount: 350,
      currentCount: 2,
      previousAmount: 300,
      previousCount: 2,
      amountDifference: 50,
      amountVariationPct: 16.67,
      countDifference: 0,
      countVariationPct: 0,
    },
  ],
  businessUnits: [],
};

describe("buildBranchExpenseReportCsv", () => {
  it("includes the summary, parent, child and branch rows", () => {
    const csv = buildBranchExpenseReportCsv(data, "Noviembre 2026");

    expect(csv).toContain('"Reporte de gastos","Noviembre 2026"');
    expect(csv).toContain('"Costo de ventas","350","300","16.67%","2"');
    expect(csv).toContain('"  Gas ""LP""","350","300","16.67%","2"');
    expect(csv).toContain('"Centro","350","300","16.67%","2"');
  });
});
