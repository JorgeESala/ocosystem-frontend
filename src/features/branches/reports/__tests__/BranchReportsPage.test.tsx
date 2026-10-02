import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BranchReportsPage from "../pages/BranchReportsPage";

const { captured } = vi.hoisted(() => ({
  captured: {} as {
    consolidated?: {
      selectedBranchIds: number[];
      dates: { start: Date; end: Date };
    };
    sales?: { branchId: number; branchName: string };
  },
}));

vi.mock("@/features/branches/branch/reportBranches.queries", () => ({
  useReportBranches: () => ({
    branches: [
      { id: 1, name: "Norte" },
      { id: 2, name: "Sur" },
    ],
    excluded: [],
    isLoading: false,
  }),
}));

vi.mock("../components/ConsolidatedSalesDashboard", () => ({
  ConsolidatedSalesDashboard: (props: {
    selectedBranchIds: number[];
    dates: { start: Date; end: Date };
  }) => {
    captured.consolidated = props;
    return <div data-testid="consolidated" />;
  },
}));

vi.mock("../components/SalesDashboard", () => ({
  SalesDashboard: (props: { branchId: number; branchName: string }) => {
    captured.sales = props;
    return <div data-testid="sales" />;
  },
}));

const renderPage = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <BranchReportsPage />
    </MemoryRouter>,
  );

const resetCaptured = () => {
  captured.consolidated = undefined;
  captured.sales = undefined;
};

describe("BranchReportsPage scope params", () => {
  it("applies scope and dates from params", () => {
    resetCaptured();

    renderPage(
      "/business/sucursales/reports?branches=1,2&start=2026-09-01&end=2026-09-07",
    );

    expect(screen.getByTestId("consolidated")).toBeTruthy();
    expect(captured.consolidated?.selectedBranchIds).toEqual([1, 2]);
    expect(captured.consolidated?.dates.start).toEqual(new Date(2026, 8, 1));
    expect(captured.consolidated?.dates.end).toEqual(new Date(2026, 8, 7));
  });

  it("keeps defaults without scope params", () => {
    resetCaptured();

    renderPage("/business/sucursales/reports");

    expect(screen.getByTestId("consolidated")).toBeTruthy();
    expect(captured.consolidated?.selectedBranchIds).toEqual([]);
    expect(captured.consolidated?.dates.start).toBeInstanceOf(Date);
  });

  it("keeps single-branch drilldown precedence", () => {
    resetCaptured();

    renderPage("/business/sucursales/reports?branch=2");

    expect(screen.getByTestId("sales")).toBeTruthy();
    expect(captured.sales?.branchId).toBe(2);
    expect(captured.sales?.branchName).toBe("Sur");
  });
});
