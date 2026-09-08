import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  CargosHelpContent,
  PagosHelpContent,
  SaldoFinalHelpContent,
  SaldoInicialHelpContent,
} from "@/features/accounting/components/AccountingHelpContent";

describe("EggAccountingHelpContent", () => {
  it("explains how the starting balance is obtained", () => {
    render(<SaldoInicialHelpContent />);
    expect(
      screen.getByText(/saldo actual menos los movimientos del mes/i),
    ).toBeInTheDocument();
  });

  it("explains what counts as charges", () => {
    render(<CargosHelpContent />);
    expect(screen.getByText(/deudas creadas en el mes/i)).toBeInTheDocument();
  });

  it("explains what counts as payments", () => {
    render(<PagosHelpContent />);
    expect(screen.getByText(/pagos, compensaciones/i)).toBeInTheDocument();
  });

  it("states the reconciliation identity", () => {
    render(<SaldoFinalHelpContent />);
    expect(screen.getByText(/inicial \+ cargos/i)).toBeInTheDocument();
  });
});
