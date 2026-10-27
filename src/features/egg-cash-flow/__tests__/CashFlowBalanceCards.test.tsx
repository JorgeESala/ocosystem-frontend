import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { formatMXN } from "@/utils/moneyNumbers";
import CashFlowBalanceCards from "../components/CashFlowBalanceCards";
import type { CashFlowSummary } from "../types/eggCashFlow.types";

const summary: CashFlowSummary = {
  from: "2026-08-22",
  to: "2026-08-28",
  cashOpeningBalance: 0,
  cashClosingBalance: 0,
  bankOpeningBalance: 153924,
  bankClosingBalance: 59829,
  totalBalance: 59829,
  totalIncome: 139605,
  totalBankIncome: 0,
  totalCollections: 139605,
  totalCashExpenses: 0,
  totalDeposits: 139605,
  totalRemesaPayments: 0,
  totalCashRemesaPayments: 0,
  totalCashAdjustments: 0,
  totalBankAdjustments: -233700,
  remesaDebtTotal: 95720.88,
  realBankBalance: 59829,
  realCashBalance: 0,
  closed: true,
};

describe("CashFlowBalanceCards", () => {
  it("shows the period cash income next to the balances", () => {
    render(<CashFlowBalanceCards summary={summary} accountHolder="Titular" />);

    expect(screen.getByText("Efectivo en oficina (saldo)")).toBeInTheDocument();
    expect(screen.getByText("Cobranza del periodo")).toBeInTheDocument();
    expect(screen.getByText(formatMXN(139605))).toBeInTheDocument();
    expect(screen.getByText("Cuenta de Titular")).toBeInTheDocument();
  });

  it("includes the adjustment in the period income", () => {
    render(
      <CashFlowBalanceCards
        summary={{
          ...summary,
          totalIncome: 133507,
          totalCollections: 133507,
          totalCashAdjustments: 21634.47,
        }}
        accountHolder="Titular"
      />,
    );

    expect(screen.getByText(formatMXN(155141.47))).toBeInTheDocument();
  });
});
