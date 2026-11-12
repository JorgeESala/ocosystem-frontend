import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MockResponsiveContainer } from "@/test/rechartsMock";
import type { SalesReportDTO } from "../api/salesReports.api";
import type { ProductAnalyticsDTO } from "../api/productAnalytics.api";
import { SalesDashboard } from "../components/SalesDashboard";

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: MockResponsiveContainer,
}));

const report: SalesReportDTO = {
  summary: {
    totalSales: 1000,
    totalUnits: 10,
    totalSlaughtered: 5,
    totalTickets: 5,
    realTickets: 4,
    totalChickenTickets: 3,
    ticketsWithComplements: 1,
    avgChickenOnlyTicketValue: 100,
    avgFullTicketValue: 200,
  },
  products: [
    {
      productBarcode: "P1",
      productName: "Pollo",
      categoryName: "Pollo",
      quantitySold: 5,
      totalSales: 800,
      unitName: "Pieza",
      attachmentFrequency: 1,
      categoryId: 1,
      receivedQuantity: 10,
    },
  ],
  categories: [
    { categoryId: 1, categoryName: "Pollo", totalSales: 800, quantitySold: 5 },
  ],
  categoryCosts: [{ categoryId: 1, categoryName: "Pollo", totalCost: 500 }],
  dailySales: [
    { day: "2026-06-01", totalSales: 800, totalTickets: 2, realTickets: 2 },
  ],
  dailyCategorySales: [],
};

const analytics: ProductAnalyticsDTO = {
  startDate: "2026-06-01",
  endDate: "2026-06-07",
  total: 0,
  products: [],
};

vi.mock("../api/salesReportes.queries", () => ({
  useSalesReport: () => ({ data: report, isLoading: false, isError: false }),
}));

vi.mock("../api/productAnalytics.queries", () => ({
  useProductAnalytics: () => ({ data: analytics, isLoading: false }),
  useProductDetail: () => ({ data: null, isLoading: false, isError: false }),
}));

describe("SalesDashboard category costs", () => {
  it("renders the sales and costs category cards for the branch", () => {
    render(
      <SalesDashboard
        branchId={1}
        branchName="Centro"
        dates={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 7) }}
        onDatesChange={() => undefined}
        onBack={() => undefined}
      />,
    );

    expect(screen.getByText("Ventas por categoría")).toBeTruthy();
    expect(screen.getByText("Costos por categoría")).toBeTruthy();
  });
});
