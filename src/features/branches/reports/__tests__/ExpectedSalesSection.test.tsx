import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MockResponsiveContainer } from "@/test/rechartsMock";
import type { ExpectedSalesReportDTO } from "../api/expectedSales.api";
import { ExpectedSalesSection } from "../components/ExpectedSalesSection";

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: MockResponsiveContainer,
}));

const report: ExpectedSalesReportDTO = {
  summary: {
    expectedKg: 1000,
    reportedKg: 1050,
    differenceKg: 50,
    variancePct: 5,
    birdsSold: 600,
    avgChickenWeight: 1.9,
    salesCount: 3,
    salesWithoutWeight: 0,
    daysWithData: 1,
    wastePerChickenKg: 0.25,
  },
  branches: [
    {
      branchId: 1,
      branchName: "Centro",
      expectedKg: 1000,
      reportedKg: 1050,
      differenceKg: 50,
      variancePct: 5,
      birdsSold: 600,
      avgChickenWeight: 1.9,
      salesCount: 3,
      salesWithoutWeight: 0,
      daysWithData: 1,
    },
  ],
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
    },
  ],
};

describe("ExpectedSalesSection", () => {
  it("renders the expected, reported and difference totals", () => {
    render(<ExpectedSalesSection data={report} />);

    expect(screen.getByText("Venta esperada vs vendida (kg)")).toBeTruthy();
    expect(screen.getByText("1,000 kg")).toBeTruthy();
    expect(screen.getByText("1,050 kg")).toBeTruthy();
    expect(screen.getByText("50 kg")).toBeTruthy();
    expect(screen.getAllByText("+5.0%").length).toBeGreaterThan(0);
    expect(screen.getByText("600 pollos vendidos")).toBeTruthy();
  });

  it("warns about sales without a batch weight", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: { ...report.summary, salesWithoutWeight: 2 },
        }}
      />,
    );

    expect(
      screen.getByText(/2 ventas sin peso promedio de remesa/),
    ).toBeTruthy();
  });

  it("uses the singular warning for one sale without a batch weight", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          summary: { ...report.summary, salesWithoutWeight: 1 },
        }}
      />,
    );

    expect(
      screen.getByText(/1 venta sin peso promedio de remesa no se incluye/),
    ).toBeTruthy();
  });

  it("shows a loading message before the first load", () => {
    render(<ExpectedSalesSection isLoading />);

    expect(screen.getByText("Cargando venta esperada...")).toBeTruthy();
  });

  it("handles a missing report without crashing", () => {
    render(<ExpectedSalesSection />);

    expect(
      screen.getByText(
        "No hay ventas de remesa con peso promedio disponible en el periodo.",
      ),
    ).toBeTruthy();
  });

  it("notes when the daily rows combine several branches", () => {
    render(
      <ExpectedSalesSection
        data={{
          ...report,
          daily: [
            report.daily[0],
            {
              ...report.daily[0],
              branchId: 2,
              branchName: "Norte",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByText(/Suma de las sucursales seleccionadas/),
    ).toBeTruthy();
  });

  it("explains when there is no expected sales data", () => {
    render(
      <ExpectedSalesSection
        data={{
          summary: {
            ...report.summary,
            expectedKg: null,
            reportedKg: null,
            differenceKg: null,
            variancePct: null,
            birdsSold: 0,
            avgChickenWeight: null,
            salesCount: 0,
            daysWithData: 0,
            salesWithoutWeight: 1,
          },
          branches: [],
          daily: [],
        }}
      />,
    );

    expect(
      screen.getByText(
        "No hay ventas de remesa con peso promedio disponible en el periodo.",
      ),
    ).toBeTruthy();
  });
});
