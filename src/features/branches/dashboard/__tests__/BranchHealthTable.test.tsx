import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BranchHealthTable from "../components/BranchHealthTable";
import type { BranchesDashboardBranchDTO } from "../api/branchesDashboard.types";

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderTable = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

const row = (
  overrides: Partial<BranchesDashboardBranchDTO> = {},
): BranchesDashboardBranchDTO => ({
  branchId: 1,
  branchName: "Norte",
  totalSales: 1200,
  previousTotalSales: 1000,
  chickenSales: 500,
  otherProductsSales: 700,
  chickenPosSales: 490,
  posDays: 7,
  chickenDays: 7,
  mermaLossQuantity: 2,
  comparisonTrimmed: false,
  trimmedDays: 0,
  reconciliationStatus: "MATCH",
  chickenVariancePct: 0,
  ...overrides,
});

describe("BranchHealthTable", () => {
  it("renders branch metrics with coverage and reconciliation", () => {
    renderTable(
      <BranchHealthTable
        rows={[
          row(),
          row({
            branchId: 2,
            branchName: "Sur",
            reconciliationStatus: "DIFFERENCE",
            chickenVariancePct: 8.12,
            posDays: 3,
          }),
        ]}
        expectedDays={7}
        slug="sucursales"
      />,
    );

    expect(screen.getByText("Norte")).toBeTruthy();
    expect(screen.getByText("Sur")).toBeTruthy();
    expect(screen.getByText("7/7")).toBeTruthy();
    expect(screen.getByText("3/7")).toBeTruthy();
    expect(screen.getByText("OK")).toBeTruthy();
    expect(screen.getByText("Diferencia 8.1%")).toBeTruthy();
  });

  it("marks rows whose comparison excludes missing days", () => {
    renderTable(
      <BranchHealthTable
        rows={[
          row({
            branchId: 1,
            branchName: "Norte",
            comparisonTrimmed: true,
            trimmedDays: 2,
          }),
          row({ branchId: 2, branchName: "Sur" }),
        ]}
        expectedDays={7}
        slug="sucursales"
      />,
    );

    expect(screen.getByText("sin 2 días")).toBeTruthy();
    expect(screen.queryByText("sin 0 días")).toBeNull();
  });

  it("links each branch to its report drilldown", () => {
    renderTable(
      <BranchHealthTable rows={[row()]} expectedDays={7} slug="sucursales" />,
    );

    const link = screen.getByRole("link", { name: "Norte" });
    expect(link.getAttribute("href")).toBe(
      "/business/sucursales/reports?branch=1",
    );
  });

  it("navigates to the report drilldown when a row is clicked", () => {
    mockNavigate.mockClear();
    renderTable(
      <BranchHealthTable rows={[row()]} expectedDays={7} slug="sucursales" />,
    );

    fireEvent.click(screen.getByText("7/7"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/business/sucursales/reports?branch=1",
    );
  });

  it("navigates to the report drilldown with the keyboard", () => {
    mockNavigate.mockClear();
    renderTable(
      <BranchHealthTable rows={[row()]} expectedDays={7} slug="sucursales" />,
    );

    const tableRow = screen.getByText("Norte").closest("tr");
    expect(tableRow).toBeTruthy();
    fireEvent.keyDown(tableRow!, { key: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith(
      "/business/sucursales/reports?branch=1",
    );
  });

  it("shows compared values and the trimmed note on the delta tooltip", () => {
    renderTable(
      <BranchHealthTable
        rows={[row({ comparisonTrimmed: true, trimmedDays: 2 })]}
        expectedDays={7}
        slug="sucursales"
      />,
    );

    expect(
      screen.getByText(/Actual: \$1,200\.00 · Anterior: \$1,000\.00/),
    ).toBeTruthy();
    expect(screen.getByText(/Comparativa sin 2 días/)).toBeTruthy();
  });

  it("shows an empty state without rows", () => {
    renderTable(
      <BranchHealthTable rows={[]} expectedDays={7} slug="sucursales" />,
    );

    expect(screen.getByText(/Sin sucursales en el periodo/)).toBeTruthy();
  });

  it("shows a retry action on error", () => {
    const onRetry = vi.fn();
    renderTable(
      <BranchHealthTable
        rows={[]}
        expectedDays={7}
        slug="sucursales"
        isError
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText(/No se pudo cargar el estado/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
