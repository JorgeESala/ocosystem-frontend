import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import BranchExpenseComparison from "../components/BranchExpenseComparison";
import type { BranchExpenseComparisonResponse } from "../types";

const category = (
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

const comparison: BranchExpenseComparisonResponse = {
  current: { totalAmount: 2400, expenseCount: 25, averageAmount: 96 },
  previous: { totalAmount: 1500, expenseCount: 15, averageAmount: 100 },
  amountDifference: 900,
  amountVariationPct: 60,
  countDifference: 10,
  countVariationPct: 66.67,
  branches: [
    {
      branchId: 1,
      branchName: "Centro",
      currentAmount: 2000,
      currentCount: 20,
      previousAmount: 1000,
      previousCount: 10,
      amountDifference: 1000,
      amountVariationPct: 100,
      countDifference: 10,
      countVariationPct: 100,
      newInCurrent: false,
      byCategory: [
        category("11", "Combustible", 20, 10, 2000, 1000),
        category("12", "Alimento", 0, 5, 0, 500),
      ],
    },
    {
      branchId: 2,
      branchName: "Norte",
      currentAmount: 400,
      currentCount: 5,
      previousAmount: 0,
      previousCount: 0,
      amountDifference: 400,
      amountVariationPct: null,
      countDifference: 5,
      countVariationPct: null,
      newInCurrent: true,
      byCategory: [category("11", "Combustible", 5, 0, 400, 0)],
    },
  ],
  byCategory: [
    category("11", "Combustible", 25, 10, 2400, 1000),
    category("12", "Alimento", 0, 5, 0, 500),
  ],
};

const renderComparison = (
  overrides: Partial<Parameters<typeof BranchExpenseComparison>[0]> = {},
) =>
  render(
    <BranchExpenseComparison
      data={comparison}
      isLoading={false}
      isError={false}
      currentLabel="1 – 31 oct 2026"
      previousLabel="1 – 30 sep 2026"
      businessUnitLabel="Pollo"
      {...overrides}
    />,
  );

describe("BranchExpenseComparison", () => {
  it("shows the periods, the business unit and the branch totals", () => {
    renderComparison();

    expect(screen.getByText("Comparativa por sucursal")).toBeTruthy();
    expect(screen.getByText("Pollo")).toBeTruthy();
    expect(screen.getByText("1 – 31 oct 2026 vs 1 – 30 sep 2026")).toBeTruthy();
    expect(screen.getByText("Centro")).toBeTruthy();
    expect(screen.getByText("Norte")).toBeTruthy();
    expect(screen.getAllByText("Nuevo").length).toBeGreaterThan(0);
    expect(screen.getByText("Mayor aumento")).toBeTruthy();
    expect(screen.getByText("Combustible")).toBeTruthy();
  });

  it("explains how the comparison and its difference columns work", () => {
    renderComparison();

    expect(screen.getByLabelText("¿Cómo se compara?")).toBeTruthy();
    expect(screen.getByLabelText("Registros del periodo")).toBeTruthy();
    expect(screen.getByLabelText("Monto del periodo")).toBeTruthy();
    expect(screen.getByLabelText("Sucursales comparadas")).toBeTruthy();
    expect(screen.getByLabelText("Mayor aumento de registros")).toBeTruthy();
    expect(screen.getByLabelText("Diferencia de registros")).toBeTruthy();
    expect(screen.getByLabelText("Variación de registros")).toBeTruthy();
    expect(screen.getByLabelText("Diferencia de monto")).toBeTruthy();
    expect(screen.getByLabelText("Variación de monto")).toBeTruthy();
  });

  it("expands a branch to show its concepts with counts and amounts", () => {
    renderComparison();

    fireEvent.click(
      screen.getByRole("button", { name: "Ver conceptos de Centro" }),
    );

    const rows = screen.getAllByRole("row");
    const combustible = rows.find((row) =>
      within(row).queryByText("Combustible"),
    );
    expect(combustible).toBeTruthy();
    expect(within(combustible!).getByText("20")).toBeTruthy();
    expect(within(combustible!).getByText("10")).toBeTruthy();
    expect(within(combustible!).getByText("$2,000.00")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Ocultar conceptos de Centro" }),
    );

    expect(screen.queryByText("Alimento")).toBeNull();
  });

  it("shows the top 10 branches and lets the user search and paginate all", () => {
    const manyBranches = Array.from({ length: 30 }, (_, index) => ({
      ...comparison.branches[0],
      branchId: index + 1,
      branchName: `Sucursal ${String(index + 1).padStart(2, "0")}`,
      byCategory: comparison.branches[0].byCategory,
    }));

    renderComparison({
      data: {
        ...comparison,
        branches: manyBranches,
      },
    });

    expect(
      screen.getByRole("button", { name: "Ver todas las sucursales (30)" }),
    ).toBeTruthy();
    expect(screen.queryByText("Sucursal 11")).toBeNull();
    expect(screen.getAllByRole("row")).toHaveLength(11);

    fireEvent.click(
      screen.getByRole("button", { name: "Ver todas las sucursales (30)" }),
    );

    expect(screen.getByText("Mostrando 1–25 de 30")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("Mostrando 26–30 de 30")).toBeTruthy();
    expect(screen.getByText("Sucursal 30")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("Buscar sucursal..."), {
      target: { value: "Sucursal 30" },
    });

    expect(screen.getByText("Mostrando 1–1 de 1")).toBeTruthy();
    expect(screen.getByText("Sucursal 30")).toBeTruthy();
    expect(screen.queryByText("Sucursal 01")).toBeNull();
  });

  it("opens the concept drawer when a branch has many concepts", () => {
    const manyCategories = Array.from({ length: 10 }, (_, index) =>
      category(
        String(100 + index),
        `Concepto ${index}`,
        10 - index,
        5,
        1000 - index * 50,
        500,
      ),
    );

    renderComparison({
      data: {
        ...comparison,
        branches: [
          { ...comparison.branches[0], byCategory: manyCategories },
          comparison.branches[1],
        ],
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Ver conceptos de Centro" }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Ver todos los conceptos de Centro",
      }),
    );

    expect(screen.getByText("Comparativa de la sucursal")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("Buscar concepto de la sucursal..."),
    ).toBeTruthy();
    expect(screen.getByText("Mostrando 1–10 de 10")).toBeTruthy();

    fireEvent.change(
      screen.getByPlaceholderText("Buscar concepto de la sucursal..."),
      { target: { value: "Concepto 9" } },
    );

    const drawerTable = screen.getAllByRole("table")[1];
    expect(within(drawerTable).getByText("Concepto 9")).toBeTruthy();
    expect(within(drawerTable).queryByText("Concepto 0")).toBeNull();
  });

  it("shows an empty state and an error state", () => {
    const { rerender } = renderComparison({
      data: {
        ...comparison,
        current: { totalAmount: 0, expenseCount: 0, averageAmount: 0 },
        previous: { totalAmount: 0, expenseCount: 0, averageAmount: 0 },
        branches: [],
        byCategory: [],
      },
    });

    expect(
      screen.getByText("No hay gastos para comparar en estos periodos."),
    ).toBeTruthy();

    rerender(
      <BranchExpenseComparison
        data={undefined}
        isLoading={false}
        isError
        currentLabel="1 – 31 oct 2026"
        previousLabel="1 – 30 sep 2026"
        businessUnitLabel="Pollo"
      />,
    );

    expect(screen.getByText("No se pudo cargar la comparativa.")).toBeTruthy();
  });
});
