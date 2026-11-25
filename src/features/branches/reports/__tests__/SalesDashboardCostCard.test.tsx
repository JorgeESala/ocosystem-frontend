import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import * as XLSX from "xlsx";
import { MockResponsiveContainer } from "@/test/rechartsMock";
import type { SalesReportDTO } from "../api/salesReports.api";
import type { ProductAnalyticsDTO } from "../api/productAnalytics.api";
import { SalesDashboard } from "../components/SalesDashboard";
import { scrollToSection } from "../utils/scrollToSection";

const expectedSalesState = vi.hoisted(() => ({
  isError: false,
  refetch: vi.fn(),
}));

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: MockResponsiveContainer,
}));

vi.mock("@/hooks/useAuthRole", () => ({
  useAuthRole: () => ({ isAdmin: true }),
}));

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    aoa_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

vi.mock("../utils/scrollToSection", () => ({
  scrollToSection: vi.fn(),
}));

vi.mock("../utils/reportExcel", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../utils/reportExcel")>()),
  fetchAllProductAnalytics: vi.fn(async () => []),
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

vi.mock("../api/expectedSales.queries", () => ({
  useExpectedSalesReport: () => ({
    data: expectedSalesState.isError
      ? undefined
      : {
          summary: {
            expectedKg: 1000,
            reportedKg: 1050,
            differenceKg: 50,
            variancePct: 5,
            birdsSold: 600,
            avgChickenWeight: 1.9,
            salesCount: 3,
            salesWithoutWeight: 0,
            salesWithoutReportedKg: 0,
            daysWithData: 1,
            wastePerChickenKg: 0.25,
          },
          branches: [],
          daily: [
            {
              branchId: 1,
              branchName: "Centro",
              day: "2026-06-01",
              expectedKg: 1000,
              reportedKg: 1050,
              differenceKg: 50,
              variancePct: 5,
              birdsSold: 600,
              avgChickenWeight: 1.9,
              salesCount: 3,
              salesWithoutWeight: 0,
              salesWithoutReportedKg: 0,
            },
          ],
        },
    isLoading: false,
    isError: expectedSalesState.isError,
    refetch: expectedSalesState.refetch,
  }),
}));

vi.mock("../api/productAnalytics.queries", () => ({
  useProductAnalytics: () => ({ data: analytics, isLoading: false }),
  useProductDetail: () => ({ data: null, isLoading: false, isError: false }),
}));

describe("SalesDashboard category costs", () => {
  beforeEach(() => {
    expectedSalesState.isError = false;
    expectedSalesState.refetch.mockClear();
  });

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

  it("exports expected sales and jumps to the expected section", async () => {
    const writeFile = vi.mocked(XLSX.writeFile);

    render(
      <SalesDashboard
        branchId={1}
        branchName="Centro"
        dates={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 7) }}
        onDatesChange={() => undefined}
        onBack={() => undefined}
      />,
    );

    fireEvent.click(screen.getByText(/Vendidos: 1,050 kg/));

    expect(scrollToSection).toHaveBeenCalledWith("expected-sales-section");

    fireEvent.click(screen.getByText(/Exportar Excel/));

    await waitFor(() => expect(writeFile).toHaveBeenCalled());
  });

  it("shows the expected sales error and retries", () => {
    expectedSalesState.isError = true;

    render(
      <SalesDashboard
        branchId={1}
        branchName="Centro"
        dates={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 7) }}
        onDatesChange={() => undefined}
        onBack={() => undefined}
      />,
    );

    expect(
      screen.getByText(/No se pudo cargar la venta esperada/),
    ).toBeTruthy();
    expect(screen.getByText("No disponible")).toBeTruthy();

    fireEvent.click(screen.getByText("Reintentar"));

    expect(expectedSalesState.refetch).toHaveBeenCalledTimes(1);
  });

  it("selects today from the date presets", () => {
    const onDatesChange = vi.fn();

    render(
      <SalesDashboard
        branchId={1}
        branchName="Centro"
        dates={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 7) }}
        onDatesChange={onDatesChange}
        onBack={() => undefined}
      />,
    );

    const presets = within(screen.getByTestId("date-range-presets"));
    fireEvent.click(presets.getByRole("button", { name: "Hoy" }));

    expect(onDatesChange).toHaveBeenCalledTimes(1);
    const [start, end] = onDatesChange.mock.calls[0];
    const today = new Date().toDateString();
    expect(start.toDateString()).toBe(today);
    expect(end.toDateString()).toBe(today);
  });
});
