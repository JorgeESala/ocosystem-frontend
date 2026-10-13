import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BranchExpensesPage from "../pages/BranchExpensesPage";
import type { BranchExpenseResponseDTO } from "../types";

const mocks = vi.hoisted(() => ({
  useBranches: vi.fn(),
  useBranchExpensesSearch: vi.fn(),
}));

vi.mock("@/features/branches/branch/branch.queries", () => ({
  useBranches: mocks.useBranches,
}));

vi.mock("../api/branch-expenses.queries", () => ({
  useBranchExpensesSearch: mocks.useBranchExpensesSearch,
}));

vi.mock("../components/BranchExpenseModal", () => ({
  default: () => null,
}));

const expense: BranchExpenseResponseDTO = {
  id: 1,
  branchId: 1,
  branchName: "Centro",
  expenseCategoryId: 2,
  expenseCategoryName: "Papeleria",
  businessUnitCategoryName: "Pollo",
  amount: 150,
  date: "2026-06-01",
  reason: "Compra de plumas",
};

describe("BranchExpensesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useBranches.mockReturnValue({
      data: [{ id: 1, name: "Centro" }],
      isLoading: false,
    });
    mocks.useBranchExpensesSearch.mockReturnValue({
      data: [expense],
      isLoading: false,
      isError: false,
    });
  });

  it("consulta automáticamente con el rango por defecto y todas las sucursales", () => {
    render(
      <MemoryRouter>
        <BranchExpensesPage />
      </MemoryRouter>,
    );

    expect(mocks.useBranchExpensesSearch).toHaveBeenCalledWith({
      branchIds: [],
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });

    const filters = mocks.useBranchExpensesSearch.mock.calls[0][0];
    const days =
      (filters.endDate.getTime() - filters.startDate.getTime()) /
      (1000 * 60 * 60 * 24);
    expect(days).toBeCloseTo(7, 0);

    expect(screen.getByText("Resumen Ejecutivo")).toBeTruthy();
    expect(screen.getByText(/Todas las sucursales/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Buscar" })).toBeNull();
  });

  it("muestra los gastos devueltos por la consulta", () => {
    render(
      <MemoryRouter>
        <BranchExpensesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Compra de plumas")).toBeTruthy();
    expect(screen.getAllByText("Centro").length).toBeGreaterThan(0);
  });

  it("muestra estado vacío cuando no hay gastos en el rango", () => {
    mocks.useBranchExpensesSearch.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(
      <MemoryRouter>
        <BranchExpensesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("No hay gastos registrados.")).toBeTruthy();
  });
});
