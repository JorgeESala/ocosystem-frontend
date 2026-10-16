import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaidSummaryCard } from "../components/PaidSummaryCard";
import type { PaymentsSummary } from "../api/payments-summary.api";

const summary = (
  overrides: Partial<PaymentsSummary> = {},
): PaymentsSummary => ({
  totalCobrado: 1500,
  paymentCount: 4,
  unappliedTotal: 0,
  compensationTotal: 0,
  payers: [
    {
      payerEntityId: 10,
      payerName: "Express Chunhuhub",
      paymentCount: 4,
      totalPaid: 1500,
      unapplied: 0,
      compensated: 0,
      lastPaymentDate: "2026-10-10",
    },
  ],
  ...overrides,
});

describe("PaidSummaryCard", () => {
  it("renders the cobrado total and payment count", () => {
    render(
      <PaidSummaryCard data={summary()} isLoading={false} isError={false} />,
    );

    expect(screen.getAllByText("Cobrado en el periodo").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
    expect(screen.getByText("4 pagos")).toBeInTheDocument();
  });

  it("shows unapplied and compensation lines only when present", () => {
    const { rerender } = render(
      <PaidSummaryCard
        data={summary({ unappliedTotal: 250, compensationTotal: 100 })}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText("$250.00")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getAllByText(/Anticipos sin aplicar/).length).toBeGreaterThan(
      0,
    );

    rerender(
      <PaidSummaryCard data={summary()} isLoading={false} isError={false} />,
    );

    expect(screen.queryByText("$250.00")).not.toBeInTheDocument();
    expect(screen.queryByText("$100.00")).not.toBeInTheDocument();
  });

  it("shows a placeholder on error and a spinner while loading", () => {
    const { rerender } = render(
      <PaidSummaryCard data={undefined} isLoading={false} isError={true} />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();

    rerender(
      <PaidSummaryCard data={undefined} isLoading={true} isError={false} />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders singular pago for one payment", () => {
    render(
      <PaidSummaryCard
        data={summary({ paymentCount: 1 })}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText("1 pago")).toBeInTheDocument();
  });

  it("shows the per-client action only with payers and fires on click", () => {
    const onShowByClient = vi.fn();
    const { rerender } = render(
      <PaidSummaryCard
        data={summary()}
        isLoading={false}
        isError={false}
        onShowByClient={onShowByClient}
      />,
    );

    fireEvent.click(screen.getByText("Ver por cliente"));
    expect(onShowByClient).toHaveBeenCalledTimes(1);

    rerender(
      <PaidSummaryCard
        data={summary({ payers: [] })}
        isLoading={false}
        isError={false}
        onShowByClient={onShowByClient}
      />,
    );
    expect(screen.queryByText("Ver por cliente")).not.toBeInTheDocument();
  });

  it("hides the per-client action without a callback", () => {
    render(
      <PaidSummaryCard data={summary()} isLoading={false} isError={false} />,
    );

    expect(screen.queryByText("Ver por cliente")).not.toBeInTheDocument();
  });
});
