import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BranchProfitReportPage from "../pages/BranchProfitReportPage";
import type { BranchProfitFilters } from "../types";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    reportCalls: [] as (BranchProfitFilters | null)[],
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

vi.mock("../api/branch-profit.queries", () => ({
  useBranchProfitReport: (filters: BranchProfitFilters | null) => {
    mocks.reportCalls.push(filters);
    return {
      data: filters
        ? {
            start: "2026-09-01",
            end: "2026-09-07",
            totalSales: 1000,
            totalExpenses: 100,
            totalChickenCostsProRated: 400,
            profit: 500,
            batchDetails: [],
            cashDetails: [],
          }
        : undefined,
      isLoading: false,
      isError: false,
    };
  },
}));

vi.mock("@/features/branches/expenses/api/branch-expenses.queries", () => ({
  useBranchExpensesSearch: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("../api/useImportedSalesByBranches", () => ({
  useImportedSalesByBranches: () => ({
    byBranch: [],
    dailyTotalsByBranch: new Map(),
    dailyMatadosByBranch: new Map(),
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("../api/useBatchSalesByDateRange", () => ({
  useBatchSalesByDateRange: () => ({
    dailyTotals: new Map(),
    dailyQuantityByDate: new Map(),
    dailyQuantityByBranch: new Map(),
  }),
}));

const renderPage = (entry: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route
            path="/business/:slug/profit"
            element={<BranchProfitReportPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("BranchProfitReportPage scope params", () => {
  it("applies scope params and generates the report automatically", async () => {
    mocks.reportCalls = [];

    renderPage(
      "/business/sucursales/profit?branches=1,2&start=2026-09-01&end=2026-09-07",
    );

    const autoCall = mocks.reportCalls.find((filters) => filters !== null);
    expect(autoCall?.branchIds).toEqual([1, 2]);
    expect(autoCall?.startDate).toEqual(new Date(2026, 8, 1));
    expect(autoCall?.endDate).toEqual(new Date(2026, 8, 7));
    expect(await screen.findByText(/Resumen Ejecutivo/)).toBeTruthy();
  });

  it("keeps manual behavior without scope params", () => {
    mocks.reportCalls = [];

    renderPage("/business/sucursales/profit");

    expect(mocks.reportCalls).toEqual([null]);
    expect(screen.getByText(/todavía no tiene filtros aplicados/)).toBeTruthy();
  });

  it("ignores unknown branches and invalid ranges", () => {
    mocks.reportCalls = [];

    renderPage(
      "/business/sucursales/profit?branches=99&start=2026-09-07&end=2026-09-01",
    );

    expect(mocks.reportCalls).toEqual([null]);
    expect(screen.getByText(/todavía no tiene filtros aplicados/)).toBeTruthy();
  });
});
