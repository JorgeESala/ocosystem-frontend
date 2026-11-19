import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildBranchExpenseReportCsv,
  downloadBranchExpenseReportCsv,
} from "../utils/report-csv";
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

describe("branch expense report CSV download", () => {
  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:report"),
      configurable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true,
    });
  });

  it("builds zero percentages and includes business units", () => {
    const empty = {
      ...data,
      current: { ...data.current, totalAmount: 0 },
      businessUnits: [
        {
          id: 3,
          name: "Pollo",
          currentAmount: 0,
          currentCount: 0,
          previousAmount: 0,
          previousCount: 0,
          amountDifference: 0,
          amountVariationPct: null,
          countDifference: 0,
          countVariationPct: null,
        },
      ],
    };

    const csv = buildBranchExpenseReportCsv(empty, "Sin gastos");

    expect(csv).toContain('"0.00%"');
    expect(csv).toContain('"Pollo","0","0","","0"');
  });

  it("creates and revokes a download link", () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    downloadBranchExpenseReportCsv(data, "Noviembre 2026");

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:report");
    click.mockRestore();
  });
});
