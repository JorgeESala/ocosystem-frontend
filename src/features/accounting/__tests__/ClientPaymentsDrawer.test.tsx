import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClientPaymentsDrawer } from "../components/ClientPaymentsDrawer";
import type { ClientPaid } from "../api/payments-summary.api";

const payers: ClientPaid[] = [
  {
    payerEntityId: 10,
    payerName: "Express Chunhuhub",
    paymentCount: 3,
    totalPaid: 800,
    unapplied: 0,
    compensated: 50,
    lastPaymentDate: "2026-10-10",
  },
  {
    payerEntityId: 11,
    payerName: "Doña María",
    paymentCount: 1,
    totalPaid: 300,
    unapplied: 100,
    compensated: 0,
    lastPaymentDate: null,
  },
];

const baseProps = {
  open: true,
  onClose: () => {},
  isLoading: false,
  periodLabel: "1 — 31 oct 2026",
};

describe("ClientPaymentsDrawer", () => {
  it("renders the payers table with the period subtitle", () => {
    render(<ClientPaymentsDrawer {...baseProps} payers={payers} />);

    expect(
      screen.getByText("Pagos por cliente en el periodo"),
    ).toBeInTheDocument();
    expect(screen.getByText("1 — 31 oct 2026")).toBeInTheDocument();
    expect(screen.getByText("Express Chunhuhub")).toBeInTheDocument();
    expect(screen.getByText("Doña María")).toBeInTheDocument();
    expect(screen.getByText("$1,100.00")).toBeInTheDocument();
  });

  it("shows the empty state without payers", () => {
    render(<ClientPaymentsDrawer {...baseProps} payers={[]} />);

    expect(
      screen.getByText(/Sin pagos registrados en el periodo/),
    ).toBeInTheDocument();
  });

  it("shows a spinner while loading", () => {
    render(
      <ClientPaymentsDrawer {...baseProps} payers={[]} isLoading={true} />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
