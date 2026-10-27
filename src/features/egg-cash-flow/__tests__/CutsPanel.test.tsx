import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { formatMXN } from "@/utils/moneyNumbers";
import CutsPanel from "../components/CutsPanel";
import type { CashFlowCut } from "../types/eggCashFlow.types";

const cut = (overrides: Partial<CashFlowCut> = {}): CashFlowCut => ({
  id: 1,
  weekStart: "2026-08-22",
  weekEnd: "2026-08-28",
  cashOpeningBalance: 0,
  cashClosingBalance: 0,
  bankOpeningBalance: 153924,
  bankClosingBalance: 59829,
  totalIncome: 139605,
  totalBankIncome: 0,
  totalCollections: 139605,
  totalCashAdjustments: 0,
  totalCashExpenses: 0,
  totalDeposits: 139605,
  totalRemesaPayments: 0,
  remesaDebtTotal: 95720.88,
  realBankBalance: 59829,
  realCashBalance: 0,
  bankDifference: 0,
  cashDifference: 0,
  note: "Excel agosto22-28",
  createdBy: 1,
  createdAt: "2026-10-26T00:00:00",
  ...overrides,
});

describe("CutsPanel", () => {
  it("shows the weekly caja chica income and closing next to the bank", () => {
    render(<CutsPanel cuts={[cut()]} />);

    expect(screen.getByText("Caja chica (ingreso)")).toBeInTheDocument();
    expect(
      screen.getByText("Efectivo en oficina (cierre)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Saldo real banco")).toBeInTheDocument();
    expect(screen.getByText("Efectivo real")).toBeInTheDocument();
    expect(screen.getByText(formatMXN(139605))).toBeInTheDocument();
    expect(screen.getAllByText(formatMXN(0)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(formatMXN(59829)).length).toBeGreaterThan(0);
    expect(screen.getByText("Deuda remesas (proveedores)")).toBeInTheDocument();
  });

  it("only offers reopen on the latest cut", () => {
    const onReopen = vi.fn();
    render(
      <CutsPanel
        cuts={[
          cut({ id: 2, weekStart: "2026-08-29", weekEnd: "2026-09-04" }),
          cut({ id: 1 }),
        ]}
        onReopen={onReopen}
      />,
    );

    const buttons = screen.getAllByRole("button", { name: "Reabrir" });
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Si" }));
    expect(onReopen).toHaveBeenCalledWith(2);
  });
});
