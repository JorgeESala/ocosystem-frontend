import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MockResponsiveContainer } from "@/test/rechartsMock";
import type { ConsolidatedSalesReportDTO } from "../api/consolidatedSales.api";
import type { ProductAnalyticsDTO } from "../api/productAnalytics.api";
import { ConsolidatedSalesDashboard } from "../components/ConsolidatedSalesDashboard";

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: MockResponsiveContainer,
}));

const report: ConsolidatedSalesReportDTO = {
  summary: {
    totalSales: 1000,
    totalUnits: 10,
    totalTickets: 5,
    realTickets: 4,
    totalSlaughtered: 5,
    totalChickenTickets: 3,
    ticketsWithComplements: 1,
    avgChickenOnlyTicketValue: 100,
    avgFullTicketValue: 200,
    attachRate: 50,
    avgTicket: 250,
    mermaQuantity: 0,
    mermaLossQuantity: 0,
  },
  previousSummary: null,
  branchSummary: [
    {
      branchId: 1,
      branchName: "Centro",
      totalSales: 1000,
      totalTickets: 5,
      realTickets: 4,
      avgTicket: 250,
      totalSlaughtered: 5,
      mermaQuantity: 0,
      totalChickenTickets: 3,
      ticketsWithComplements: 1,
      attachRate: 50,
      daysWithReport: 7,
    },
  ],
  previousBranchSummary: [],
  dailySales: [
    { day: "2026-06-01", totalSales: 1000, totalTickets: 5, realTickets: 4 },
  ],
  categories: [
    { categoryId: 1, categoryName: "Pollo", totalSales: 800, quantitySold: 5 },
  ],
  categoryCosts: [{ categoryId: 1, categoryName: "Pollo", totalCost: 500 }],
};

const analytics: ProductAnalyticsDTO = {
  startDate: "2026-06-01",
  endDate: "2026-06-07",
  total: 0,
  products: [],
};

vi.mock("../components/CategoryMixCard", () => ({
  CategoryMixCard: ({
    title,
    categories,
  }: {
    title?: string;
    categories: unknown[];
  }) => <div>{`${title ?? "Ventas por categoría"}:${categories.length}`}</div>,
}));

vi.mock("@/features/branches/branch/reportBranches.queries", () => ({
  useReportBranches: () => ({
    branches: [{ id: 1, name: "Centro" }],
    excluded: [],
    isLoading: false,
  }),
}));

vi.mock("../api/consolidatedSales.queries", () => ({
  useConsolidatedSalesReport: () => ({
    data: report,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("../api/productAnalytics.queries", () => ({
  useProductAnalytics: () => ({ data: analytics, isLoading: false }),
  useProductDetail: () => ({ data: null, isLoading: false, isError: false }),
}));

vi.mock("../api/wasteReport.queries", () => ({
  useWasteReport: () => ({ data: null, isLoading: false, isError: false }),
}));

describe("ConsolidatedSalesDashboard category costs", () => {
  it("renders the sales and costs category cards in the consolidated report", () => {
    render(
      <MemoryRouter>
        <ConsolidatedSalesDashboard
          dates={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 7) }}
          onDatesChange={() => undefined}
          selectedBranchIds={[]}
          onSelectedBranchIdsChange={() => undefined}
          onSelectBranch={() => undefined}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Ventas por categoría:1")).toBeTruthy();
    expect(screen.getByText("Costos por categoría:1")).toBeTruthy();
  });
});
