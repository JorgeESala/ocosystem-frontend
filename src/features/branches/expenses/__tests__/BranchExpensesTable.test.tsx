import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import BranchExpensesTable from "../components/BranchExpensesTable";
import type { BranchExpenseResponseDTO } from "../types";

const expense = (index: number): BranchExpenseResponseDTO => ({
  id: index,
  branchId: index % 2 === 0 ? 1 : 2,
  branchName: index % 2 === 0 ? "Centro" : "Norte",
  expenseCategoryId: 11,
  expenseCategoryName: "Combustible",
  businessUnitCategoryId: 21,
  businessUnitCategoryName: "Pollo",
  amount: 100,
  date: "2026-10-01",
  reason: `Gasto ${String(index).padStart(2, "0")}`,
});

const expenses = Array.from({ length: 30 }, (_, index) => expense(index + 1));

describe("BranchExpensesTable", () => {
  it("paginates and keeps the total for the full result", () => {
    render(<BranchExpensesTable expenses={expenses} />);

    expect(screen.getByText("Mostrando 1–25 de 30")).toBeTruthy();
    const totalRow = screen.getByText("Total de resultados").closest("tr");
    expect(totalRow?.textContent).toContain("$3,000.00");
    expect(screen.getByText("Gasto 01")).toBeTruthy();
    expect(screen.queryByText("Gasto 26")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(screen.getByText("Mostrando 26–30 de 30")).toBeTruthy();
    expect(screen.getByText("Gasto 26")).toBeTruthy();
  });

  it("searches branch detail and recalculates the total", () => {
    render(<BranchExpensesTable expenses={expenses} />);

    fireEvent.change(screen.getByPlaceholderText("Buscar en gastos..."), {
      target: { value: "Norte" },
    });

    expect(screen.getByText("Mostrando 1–15 de 15")).toBeTruthy();
    expect(screen.getAllByText("Norte").length).toBeGreaterThan(0);
    const totalRow = screen.getByText("Total de resultados").closest("tr");
    expect(totalRow?.textContent).toContain("$1,500.00");
  });

  it("resets to page one when the parent filters change", () => {
    const { rerender } = render(
      <BranchExpensesTable expenses={expenses} resetKey="a" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("Mostrando 26–30 de 30")).toBeTruthy();

    rerender(<BranchExpensesTable expenses={expenses} resetKey="b" />);

    expect(screen.getByText("Mostrando 1–25 de 30")).toBeTruthy();
  });

  it("anchors the search scope help to the right edge", () => {
    render(<BranchExpensesTable expenses={expenses} />);

    const help = screen.getByLabelText("Alcance de la búsqueda");
    expect(help.querySelector('[role="tooltip"]')).toHaveClass("right-0");
  });

  it("changes the page size", () => {
    render(<BranchExpensesTable expenses={expenses} />);

    fireEvent.change(screen.getByLabelText("Por página"), {
      target: { value: "50" },
    });

    expect(screen.getByText("Mostrando 1–30 de 30")).toBeTruthy();
  });
});
