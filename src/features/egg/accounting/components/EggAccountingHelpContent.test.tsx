import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  CancelarPagoHelpContent,
  CargosHelpContent,
  ConfirmacionPagoHelpContent,
  PagosHelpContent,
  SaldoFavorHelpContent,
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

  it("explains that available credit is never applied on its own", () => {
    render(<SaldoFavorHelpContent />);
    expect(screen.getByText(/no se aplica solo/i)).toBeInTheDocument();
  });

  it("explains the confirmation step before saving an advance", () => {
    render(<ConfirmacionPagoHelpContent />);
    expect(
      screen.getByText(/nada se guarda hasta que eliges una opción/i),
    ).toBeInTheDocument();
  });

  it("explains the impact of cancelling a payment", () => {
    render(<CancelarPagoHelpContent />);
    expect(
      screen.getByText(/cuántas deudas se reactivarán/i),
    ).toBeInTheDocument();
  });
});
