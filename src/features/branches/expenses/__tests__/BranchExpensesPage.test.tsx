import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BranchExpensesPage from "../pages/BranchExpensesPage";
import type { BranchExpenseResponseDTO } from "../types";

const mocks = vi.hoisted(() => ({
  useBranches: vi.fn(),
  useBranchExpensesSearch: vi.fn(),
  useExpenseCategories: vi.fn(),
  useBranchBusinessCategories: vi.fn(),
}));

vi.mock("@/features/branches/branch/branch.queries", () => ({
  useBranches: mocks.useBranches,
}));

vi.mock("../api/branch-expenses.queries", () => ({
  useBranchExpensesSearch: mocks.useBranchExpensesSearch,
}));

vi.mock("../api/branch-categories.queries", () => ({
  useExpenseCategories: mocks.useExpenseCategories,
  useBranchBusinessCategories: mocks.useBranchBusinessCategories,
}));

vi.mock("../components/BranchExpenseModal", () => ({
  default: () => null,
}));

const expense: BranchExpenseResponseDTO = {
  id: 1,
  branchId: 1,
  branchName: "Centro",
  expenseCategoryId: 11,
  expenseCategoryName: "Papeleria",
  businessUnitCategoryId: 21,
  businessUnitCategoryName: "Pollo",
  amount: 150,
  date: "2026-06-01",
  reason: "Compra de plumas",
};

const secondExpense: BranchExpenseResponseDTO = {
  id: 2,
  branchId: 1,
  branchName: "Centro",
  expenseCategoryId: 12,
  expenseCategoryName: "Limpieza",
  businessUnitCategoryId: 21,
  businessUnitCategoryName: "Pollo",
  amount: 300,
  date: "2026-06-02",
  reason: "Jabon y desinfectante",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <BranchExpensesPage />
    </MemoryRouter>,
  );

describe("BranchExpensesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useBranches.mockReturnValue({
      data: [{ id: 1, name: "Centro" }],
      isLoading: false,
    });
    mocks.useExpenseCategories.mockReturnValue({
      data: [
        { id: 11, name: "Papeleria" },
        { id: 12, name: "Limpieza" },
      ],
    });
    mocks.useBranchBusinessCategories.mockReturnValue({
      data: [{ id: 21, name: "Pollo" }],
    });
    mocks.useBranchExpensesSearch.mockReturnValue({
      data: [expense],
      isLoading: false,
      isError: false,
    });
  });

  it("consulta automáticamente con el rango por defecto y todas las sucursales", () => {
    renderPage();

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
    renderPage();

    expect(screen.getByText("Compra de plumas")).toBeTruthy();
    expect(screen.getAllByText("Centro").length).toBeGreaterThan(0);
  });

  it("muestra estado vacío cuando no hay gastos en el rango", () => {
    mocks.useBranchExpensesSearch.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getByText("No hay gastos registrados.")).toBeTruthy();
  });

  it("filtra por tipo de gasto con las chips", () => {
    mocks.useBranchExpensesSearch.mockReturnValue({
      data: [expense, secondExpense],
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getByText("Compra de plumas")).toBeTruthy();
    expect(screen.getByText("Jabon y desinfectante")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Limpieza" }));

    expect(screen.queryByText("Compra de plumas")).toBeNull();
    expect(screen.getByText("Jabon y desinfectante")).toBeTruthy();
  });

  it("filtra por motivo de forma insensible a mayúsculas", () => {
    mocks.useBranchExpensesSearch.mockReturnValue({
      data: [expense, secondExpense],
      isLoading: false,
      isError: false,
    });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Ej. plumas"), {
      target: { value: "JABON" },
    });

    expect(screen.queryByText("Compra de plumas")).toBeNull();
    expect(screen.getByText("Jabon y desinfectante")).toBeTruthy();
  });

  it("al hacer clic en un renglón del desglose aplica y quita el filtro", () => {
    mocks.useBranchExpensesSearch.mockReturnValue({
      data: [expense, secondExpense],
      isLoading: false,
      isError: false,
    });

    renderPage();

    const breakdownSection = screen
      .getByText("Desglose por tipo de gasto")
      .closest("section");
    expect(breakdownSection).toBeTruthy();

    const breakdownRow = within(breakdownSection!)
      .getByText("Limpieza")
      .closest("tr");
    expect(breakdownRow).toBeTruthy();

    fireEvent.click(breakdownRow!);

    expect(screen.queryByText("Compra de plumas")).toBeNull();
    expect(screen.getByText("Jabon y desinfectante")).toBeTruthy();

    fireEvent.click(breakdownRow!);

    expect(screen.getByText("Compra de plumas")).toBeTruthy();
    expect(screen.getByText("Jabon y desinfectante")).toBeTruthy();
  });
});
