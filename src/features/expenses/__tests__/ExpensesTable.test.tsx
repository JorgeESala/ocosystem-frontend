import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import ExpensesTable from "../components/ExpensesTable";
import { ExpenseCategoryCode } from "@/core/api/types";
import type { ExpenseResponseDTO } from "../types/expense.types";

const expense = (index: number): ExpenseResponseDTO => ({
  id: index,
  categoryCode: ExpenseCategoryCode.FUEL,
  categoryName: "Combustible",
  expenseType: "COMBUSTIBLE",
  reason: `Gasto ${String(index).padStart(2, "0")}`,
  amount: 100,
  date: "2026-10-01",
});

const expenses = Array.from({ length: 60 }, (_, index) => expense(index + 1));

describe("ExpensesTable", () => {
  it("paginates the detail rows", () => {
    render(<ExpensesTable expenses={expenses} />);

    expect(screen.getByText("Mostrando 1–25 de 60")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(26);
    expect(screen.getByText("Gasto 01")).toBeTruthy();
    expect(screen.queryByText("Gasto 26")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(screen.getByText("Mostrando 26–50 de 60")).toBeTruthy();
    expect(screen.getByText("Gasto 26")).toBeTruthy();
  });

  it("searches the full detail list", () => {
    render(<ExpensesTable expenses={expenses} />);

    fireEvent.change(screen.getByPlaceholderText("Buscar en gastos..."), {
      target: { value: "Gasto 60" },
    });

    expect(screen.getByText("Mostrando 1–1 de 1")).toBeTruthy();
    expect(screen.getByText("Gasto 60")).toBeTruthy();
    expect(screen.queryByText("Gasto 01")).toBeNull();
  });

  it("changes the page size", () => {
    render(<ExpensesTable expenses={expenses} />);

    fireEvent.change(screen.getByLabelText("Por página"), {
      target: { value: "50" },
    });

    expect(screen.getByText("Mostrando 1–50 de 60")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(51);
  });

  it("keeps selection working on paginated rows", () => {
    const onSelect = vi.fn();
    render(<ExpensesTable expenses={expenses} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("Gasto 01"));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it("shows the end of the table summary", () => {
    render(<ExpensesTable expenses={expenses.slice(0, 10)} />);

    expect(screen.getByText("Mostrando 1–10 de 10")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(11);
    expect(
      within(screen.getByRole("table")).getByText("Gasto 10"),
    ).toBeTruthy();
  });
});
