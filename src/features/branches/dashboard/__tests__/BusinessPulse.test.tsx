import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BusinessPulse from "../components/BusinessPulse";
import type {
  BranchesDashboardCoverageDTO,
  BranchesDashboardSummaryDTO,
} from "../api/branchesDashboard.types";

const summary = (
  overrides: Partial<BranchesDashboardSummaryDTO> = {},
): BranchesDashboardSummaryDTO => ({
  totalSales: 1200,
  previousTotalSales: 1000,
  chickenSales: 500,
  previousChickenSales: 400,
  otherProductsSales: 700,
  previousOtherProductsSales: 600,
  chickenCosts: 450,
  chickenProfit: 50,
  mermaLossQuantity: 3.5,
  trimmedBranches: 0,
  ...overrides,
});

const coverage: BranchesDashboardCoverageDTO = {
  totalBranches: 9,
  branchesWithPosReport: 7,
  branchesWithChickenSales: 6,
};

const renderPulse = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

const scope = {
  branchIds: [1, 2],
  start: new Date(2026, 8, 1),
  end: new Date(2026, 8, 7),
};

const pulseProps = (
  overrides: Partial<React.ComponentProps<typeof BusinessPulse>> = {},
) => ({
  summary: summary(),
  coverage,
  slug: "sucursales",
  scope,
  ...overrides,
});

describe("BusinessPulse", () => {
  it("renders hybrid totals with their sources", () => {
    renderPulse(<BusinessPulse {...pulseProps()} />);

    expect(screen.getByText("Venta total")).toBeTruthy();
    expect(screen.getByText("$1,200")).toBeTruthy();
    expect(screen.getByText("Venta de pollo")).toBeTruthy();
    expect(screen.getByText("$500")).toBeTruthy();
    expect(screen.getByText("Otros productos")).toBeTruthy();
    expect(screen.getByText("$700")).toBeTruthy();
    expect(screen.getByText("Utilidad de pollo")).toBeTruthy();
    expect(screen.getByText("$50")).toBeTruthy();
    expect(screen.getByText(/Pollo: Entradas y ventas/)).toBeTruthy();
  });

  it("links each card to its detail page with the dashboard scope", () => {
    renderPulse(<BusinessPulse {...pulseProps()} />);

    const search = "branches=1%2C2&start=2026-09-01&end=2026-09-07";
    expect(
      screen
        .getByRole("link", { name: "Venta total: $1,200" })
        .getAttribute("href"),
    ).toBe(`/business/sucursales/reports?${search}`);
    expect(
      screen
        .getByRole("link", { name: "Venta de pollo: $500" })
        .getAttribute("href"),
    ).toBe(`/business/sucursales/profit?${search}`);
    expect(
      screen
        .getByRole("link", { name: "Otros productos: $700" })
        .getAttribute("href"),
    ).toBe(`/business/sucursales/reports?${search}`);
    expect(
      screen
        .getByRole("link", { name: "Utilidad de pollo: $50" })
        .getAttribute("href"),
    ).toBe(`/business/sucursales/profit?${search}`);
    expect(
      screen
        .getByRole("link", { name: "Pérdida neta (merma): 3.5" })
        .getAttribute("href"),
    ).toBe(`/business/sucursales/reports?${search}`);
  });

  it("shows the compared values on the delta tooltip", () => {
    renderPulse(<BusinessPulse {...pulseProps()} />);

    expect(
      screen.getByText("Actual: $1,200.00 · Anterior: $1,000.00"),
    ).toBeTruthy();
    expect(
      screen.getByText("Actual: $500.00 · Anterior: $400.00"),
    ).toBeTruthy();
  });

  it("shows merma as quantity without a monetary value", () => {
    renderPulse(<BusinessPulse {...pulseProps()} />);

    expect(screen.getByText("Pérdida neta (merma)")).toBeTruthy();
    expect(screen.getByText("3.5")).toBeTruthy();
    expect(screen.queryByText("$120")).toBeNull();
  });

  it("shows an adjusted-comparison badge when branches exclude days", () => {
    renderPulse(<BusinessPulse {...pulseProps()} />);

    expect(screen.queryByText("Comparativa ajustada")).toBeNull();

    renderPulse(
      <BusinessPulse
        {...pulseProps({ summary: summary({ trimmedBranches: 2 }) })}
      />,
    );

    expect(screen.getByText("Comparativa ajustada")).toBeTruthy();
  });

  it("shows the exact ranges being compared", () => {
    renderPulse(
      <BusinessPulse
        {...pulseProps()}
        period={{
          start: "2026-09-26",
          end: "2026-10-02",
          previousStart: "2026-09-19",
          previousEnd: "2026-09-25",
        }}
      />,
    );

    const subtitle = screen.getByTestId("compared-ranges");
    expect(subtitle.textContent).toContain("26");
    expect(subtitle.textContent).toContain("19");
    expect(subtitle.textContent).toContain("vs.");
  });

  it("hides the compared ranges without period data", () => {
    renderPulse(<BusinessPulse {...pulseProps()} />);

    expect(screen.queryByTestId("compared-ranges")).toBeNull();
  });

  it("shows coverage of branches with reports", () => {
    renderPulse(<BusinessPulse {...pulseProps()} />);

    expect(screen.getByText(/7 de 9 sucursales con reporte/)).toBeTruthy();
  });

  it("shows no comparative message when previous period has no data", () => {
    renderPulse(
      <BusinessPulse
        {...pulseProps({ summary: summary({ previousTotalSales: null }) })}
      />,
    );

    expect(screen.getAllByText("Sin comparativo").length).toBeGreaterThan(0);
  });

  it("shows a retry action on error", () => {
    const onRetry = vi.fn();
    renderPulse(<BusinessPulse {...pulseProps()} isError onRetry={onRetry} />);

    expect(screen.getByText(/No se pudo cargar el resumen/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
