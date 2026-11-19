import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BranchExpenseReport from "../components/BranchExpenseReport";
import type {
  BranchExpenseAnalyticsCategory,
  BranchExpenseAnalyticsResponse,
} from "../types";

const mocks = vi.hoisted(() => ({
  download: vi.fn(),
}));

vi.mock("../utils/report-csv", () => ({
  downloadBranchExpenseReportCsv: mocks.download,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: ({ tickFormatter }: { tickFormatter: (value: number) => string }) => (
    <div data-testid="yaxis">{tickFormatter(1000)}</div>
  ),
  Tooltip: ({
    formatter,
  }: {
    formatter: (value: number) => [string, string];
  }) => <div data-testid="chart-tooltip">{formatter(1000)[0]}</div>,
  Bar: () => null,
}));

const category = (
  overrides: Partial<BranchExpenseAnalyticsCategory> = {},
): BranchExpenseAnalyticsCategory => ({
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
  children: [],
  ...overrides,
});

const data: BranchExpenseAnalyticsResponse = {
  current: { totalAmount: 350, expenseCount: 2, averageAmount: 175 },
  previous: { totalAmount: 300, expenseCount: 2, averageAmount: 150 },
  amountDifference: 50,
  amountVariationPct: 16.67,
  countDifference: 0,
  countVariationPct: 0,
  buckets: [
    {
      key: "M-2026-01-01",
      start: "2026-01-01",
      end: "2026-01-31",
      label: "Enero 2026",
      amount: 350,
      count: 2,
      categories: [],
    },
  ],
  categories: [
    category({
      children: [
        category({
          id: 11,
          code: "GAS_LP",
          name: "Gas LP",
          parentId: 10,
          parentName: "Costo de ventas",
          currentAmount: 250,
          amountVariationPct: -5,
          children: [],
        }),
        category({
          id: 12,
          code: "OTROS",
          name: "Otros",
          parentId: 10,
          parentName: "Costo de ventas",
          currentAmount: 100,
          amountVariationPct: 0,
          children: [],
        }),
      ],
    }),
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

const renderReport = (
  overrides: Partial<Parameters<typeof BranchExpenseReport>[0]> = {},
) =>
  render(
    <BranchExpenseReport
      data={data}
      isLoading={false}
      isError={false}
      granularity="MONTH"
      onGranularityChange={vi.fn()}
      includeNonOperating={false}
      onIncludeNonOperatingChange={vi.fn()}
      scopeLabel="Noviembre 2026"
      {...overrides}
    />,
  );

describe("BranchExpenseReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a spinner while loading without data", () => {
    renderReport({ data: undefined, isLoading: true });

    expect(screen.queryByText("Reporte de gastos")).toBeNull();
  });

  it("shows the trend, categories, branches, badges and actions", () => {
    const onGranularityChange = vi.fn();
    renderReport({ onGranularityChange });

    expect(screen.getByText("Gas LP")).toBeTruthy();
    expect(screen.getByText("Centro")).toBeTruthy();
    expect(screen.getAllByText("Costo").length).toBeGreaterThan(0);
    expect(screen.getByTestId("yaxis").textContent ?? "").toContain("1");
    expect(screen.getByTestId("chart-tooltip").textContent ?? "").toContain(
      "1,000",
    );

    fireEvent.click(screen.getByRole("button", { name: "Semana" }));
    expect(onGranularityChange).toHaveBeenCalledWith("WEEK");

    fireEvent.click(screen.getByRole("button", { name: "CSV" }));
    expect(mocks.download).toHaveBeenCalledWith(data, "Noviembre 2026");
  });

  it("labels the trend according to the selected granularity", () => {
    const { rerender } = renderReport({ granularity: "WEEK" });
    expect(screen.getByText("Gasto por semana.")).toBeTruthy();

    rerender(
      <BranchExpenseReport
        data={data}
        isLoading={false}
        isError={false}
        granularity="YEAR"
        onGranularityChange={vi.fn()}
        includeNonOperating={false}
        onIncludeNonOperatingChange={vi.fn()}
        scopeLabel="Noviembre 2026"
      />,
    );
    expect(screen.getByText("Gasto por año.")).toBeTruthy();
  });

  it("shows empty states when there are no buckets, categories or branches", () => {
    renderReport({
      data: {
        ...data,
        buckets: [],
        categories: [],
        branches: [],
      },
    });

    expect(screen.getAllByText("No hay gastos en el periodo.")).toHaveLength(3);
  });
});
