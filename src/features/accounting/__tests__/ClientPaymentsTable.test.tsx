import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClientPaymentsTable } from "../components/ClientPaymentsTable";
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

describe("ClientPaymentsTable", () => {
  it("renders payers with amounts and totals", () => {
    render(<ClientPaymentsTable payers={payers} />);

    expect(screen.getByText("Express Chunhuhub")).toBeInTheDocument();
    expect(screen.getByText("Doña María")).toBeInTheDocument();
    expect(screen.getByText("$800.00")).toBeInTheDocument();
    expect(screen.getAllByText("$50.00")).toHaveLength(2);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("$1,100.00")).toBeInTheDocument();
    expect(screen.getByText("10 oct 2026")).toBeInTheDocument();
  });

  it("renders nothing without payers", () => {
    const { container } = render(<ClientPaymentsTable payers={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
