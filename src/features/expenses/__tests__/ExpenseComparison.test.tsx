import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import ExpenseComparison from "../components/ExpenseComparison";
import type { ExpenseComparisonResponse } from "../types/expense.types";

const item = (
  code: string,
  label: string,
  currentCount: number,
  previousCount: number,
  currentAmount: number,
  previousAmount: number,
) => ({
  code,
  label,
  currentCount,
  previousCount,
  currentAmount,
  previousAmount,
  amountDifference: currentAmount - previousAmount,
  amountVariationPct:
    previousAmount === 0
      ? null
      : ((currentAmount - previousAmount) / previousAmount) * 100,
  countDifference: currentCount - previousCount,
  countVariationPct:
    previousCount === 0
      ? null
      : ((currentCount - previousCount) / previousCount) * 100,
  newInCurrent: previousCount === 0 && currentCount > 0,
});

const comparison: ExpenseComparisonResponse = {
  current: { totalAmount: 2800, expenseCount: 26, averageAmount: 107.69 },
  previous: { totalAmount: 2500, expenseCount: 25, averageAmount: 100 },
  amountDifference: 300,
  amountVariationPct: 12,
  countDifference: 1,
  countVariationPct: 4,
  byCategory: [
    item("FUEL", "Combustible", 20, 10, 2000, 1000),
    item("OTHER", "Limpieza", 4, 10, 400, 1000),
    item("FOOD", "Alimento", 0, 5, 0, 500),
    item("RENT", "Renta", 2, 0, 400, 0),
  ],
  byExpenseType: [
    item("COMBUSTIBLE", "Combustible", 20, 10, 2000, 1000),
    item("OTROS", "Otros", 6, 15, 800, 1500),
  ],
};

const renderComparison = (
  overrides: Partial<Parameters<typeof ExpenseComparison>[0]> = {},
) =>
  render(
    <ExpenseComparison
      data={comparison}
      isLoading={false}
      isError={false}
      currentLabel="1 – 31 oct 2026"
      previousLabel="1 – 30 sep 2026"
      {...overrides}
    />,
  );

describe("ExpenseComparison", () => {
  it("shows the period labels, KPIs and concept comparison", () => {
    renderComparison();

    expect(screen.getByText("Comparativa de gastos")).toBeTruthy();
    expect(screen.getByText("1 – 31 oct 2026 vs 1 – 30 sep 2026")).toBeTruthy();
    expect(screen.getByText("Registros")).toBeTruthy();
    expect(screen.getByText("Monto")).toBeTruthy();
    expect(screen.getByText("Mayor aumento")).toBeTruthy();
    expect(screen.getByText("Mayor disminución")).toBeTruthy();

    const [categoryTable, typeTable] = screen.getAllByRole("table");
    const row = within(categoryTable).getByText("Combustible").closest("tr");
    expect(row).toBeTruthy();
    expect(within(row!).getByText("20")).toBeTruthy();
    expect(within(row!).getByText("10")).toBeTruthy();
    expect(within(row!).getAllByText("+100.0%").length).toBeGreaterThan(0);
    expect(within(row!).getByText("$2,000.00")).toBeTruthy();

    expect(screen.getByText("Por tipo de gasto")).toBeTruthy();
    const typeRow = within(typeTable).getByText("Otros").closest("tr");
    expect(typeRow).toBeTruthy();
    expect(within(typeRow!).getByText("6")).toBeTruthy();
    expect(within(typeRow!).getByText("15")).toBeTruthy();
  });

  it("shows the top 10 concepts and lets the user see, search and paginate all", () => {
    const manyItems = Array.from({ length: 30 }, (_, index) =>
      item(
        `Concepto ${String(index + 1).padStart(2, "0")}`,
        `Concepto ${String(index + 1).padStart(2, "0")}`,
        30 - index,
        10,
        3000 - index * 50,
        1000,
      ),
    );

    renderComparison({
      data: {
        ...comparison,
        byCategory: manyItems,
        byExpenseType: [],
      },
    });

    expect(screen.getByText("Ver todos (30)")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(11);

    fireEvent.click(screen.getByRole("button", { name: "Ver todos (30)" }));

    expect(screen.getByText("Mostrando 1–25 de 30")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(26);

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("Mostrando 26–30 de 30")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(6);

    fireEvent.change(screen.getByPlaceholderText("Buscar concepto..."), {
      target: { value: "Concepto 29" },
    });

    const table = screen.getByRole("table");
    expect(within(table).getByText("Concepto 29")).toBeTruthy();
    expect(within(table).queryByText("Concepto 01")).toBeNull();
    expect(screen.getByText("Mostrando 1–1 de 1")).toBeTruthy();
  });

  it("explains how the comparison and its difference columns work", () => {
    renderComparison();

    expect(screen.getByLabelText("¿Cómo se compara?")).toBeTruthy();
    expect(screen.getByLabelText("Registros del periodo")).toBeTruthy();
    expect(screen.getByLabelText("Monto del periodo")).toBeTruthy();
    expect(screen.getByLabelText("Mayor aumento de registros")).toBeTruthy();
    expect(
      screen.getByLabelText("Mayor disminución de registros"),
    ).toBeTruthy();
    expect(
      screen.getAllByLabelText("Diferencia de registros").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByLabelText("Variación de registros").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByLabelText("Diferencia de monto").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByLabelText("Variación de monto").length,
    ).toBeGreaterThan(0);
  });

  it("marks a new concept and a disappeared concept", () => {
    renderComparison();

    expect(screen.getAllByText("Nuevo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("-100.0%").length).toBeGreaterThan(0);
  });

  it("shows an empty state when there is nothing to compare", () => {
    renderComparison({
      data: {
        ...comparison,
        current: { totalAmount: 0, expenseCount: 0, averageAmount: 0 },
        previous: { totalAmount: 0, expenseCount: 0, averageAmount: 0 },
        byCategory: [],
        byExpenseType: [],
      },
    });

    expect(
      screen.getByText("No hay gastos para comparar en estos periodos."),
    ).toBeTruthy();
  });

  it("shows an error state", () => {
    renderComparison({ isError: true, data: undefined });

    expect(screen.getByText("No se pudo cargar la comparativa.")).toBeTruthy();
  });
});
