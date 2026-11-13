import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ExpensesPage from "../pages/ExpensesPage";

const mocks = vi.hoisted(() => ({
  useFilterExpenses: vi.fn(),
  useExpenseComparison: vi.fn(),
}));

vi.mock("../api/expense.queries", () => ({
  useFilterExpenses: mocks.useFilterExpenses,
  useExpenseComparison: mocks.useExpenseComparison,
}));

vi.mock("../components/ExpenseModal", () => ({
  default: () => null,
}));

const comparison = {
  current: { totalAmount: 0, expenseCount: 0, averageAmount: 0 },
  previous: { totalAmount: 0, expenseCount: 0, averageAmount: 0 },
  amountDifference: 0,
  amountVariationPct: null,
  countDifference: 0,
  countVariationPct: null,
  byCategory: [],
  byExpenseType: [],
};

const renderPage = () => render(<ExpensesPage unitType="EGG" />);

describe("ExpensesPage comparison", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 11));
    vi.clearAllMocks();
    mocks.useFilterExpenses.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mocks.useExpenseComparison.mockReturnValue({
      data: comparison,
      isLoading: false,
      isError: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with the current month against the same days of the previous month", () => {
    renderPage();

    expect(mocks.useFilterExpenses).toHaveBeenCalledWith("EGG", {
      start: new Date(2026, 10, 1),
      end: new Date(2026, 10, 11),
    });
    expect(mocks.useExpenseComparison).toHaveBeenCalledWith(
      "EGG",
      {
        start: new Date(2026, 10, 1),
        end: new Date(2026, 10, 11),
        previousStart: new Date(2026, 9, 1),
        previousEnd: new Date(2026, 9, 11),
      },
      { categories: [], expenseTypes: [] },
    );
    expect(screen.getByText("Comparativa de gastos")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Comparar últimos 2 meses" }),
    ).toBeTruthy();
  });

  it("compares October against September with the preset", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: "Comparar últimos 2 meses" }),
    );

    expect(mocks.useFilterExpenses).toHaveBeenLastCalledWith("EGG", {
      start: new Date(2026, 9, 1),
      end: new Date(2026, 9, 31),
    });
    expect(mocks.useExpenseComparison).toHaveBeenLastCalledWith(
      "EGG",
      {
        start: new Date(2026, 9, 1),
        end: new Date(2026, 9, 31),
        previousStart: new Date(2026, 8, 1),
        previousEnd: new Date(2026, 8, 30),
      },
      { categories: [], expenseTypes: [] },
    );
  });

  it("passes the active category and type filters to the comparison", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Agua" }));
    fireEvent.click(screen.getByRole("button", { name: "Servicios" }));

    expect(mocks.useExpenseComparison).toHaveBeenLastCalledWith(
      "EGG",
      expect.any(Object),
      { categories: ["WATER"], expenseTypes: ["SERVICIOS"] },
    );
  });
});
