import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClientMonthlyReport } from "../components/ClientMonthlyReport";
import type { PaymentApplication } from "../types/payment.types";

const mocks = vi.hoisted(() => ({
  useClientStatementSummary: vi.fn(),
  usePaymentApplications: vi.fn(),
  useCancelPayment: vi.fn(),
}));

vi.mock("@/features/accounting/api/client-summary.queries", () => ({
  useClientStatementSummary: mocks.useClientStatementSummary,
}));

vi.mock("@/features/accounting/api/payments.queries", () => ({
  usePaymentApplications: mocks.usePaymentApplications,
  useCancelPayment: mocks.useCancelPayment,
}));

const paymentMovement = {
  accountsPayableId: 11,
  creditorEntityId: 2,
  movementDate: "2026-09-05",
  movementType: "PAYMENT",
  balanceBefore: 1000,
  amount: 600,
  balanceAfter: 400,
  folio: "DEP-700",
  note: null,
  paymentId: 77,
  paymentStatus: "ACTIVE",
};

const chargeMovement = {
  accountsPayableId: 11,
  creditorEntityId: 2,
  movementDate: "2026-09-01",
  movementType: "CHARGE",
  balanceBefore: 0,
  amount: 1000,
  balanceAfter: 1000,
  folio: null,
  note: "Deuda de prueba",
  paymentId: null,
  paymentStatus: null,
};

const summaryWith = (movement: Record<string, unknown>) => ({
  debtorEntityId: 3,
  from: "2026-09-01",
  to: "2026-09-30",
  openingBalance: 0,
  totalCharges: 1000,
  totalPayments: 600,
  closingBalance: 400,
  movements: [chargeMovement, movement],
});

const application = (
  overrides: Partial<PaymentApplication> = {},
): PaymentApplication => ({
  accountsPayableId: 11,
  appliedAmount: 100,
  date: "2026-09-01",
  ...overrides,
});

const renderReport = (onSuccessToast = vi.fn()) => {
  render(
    <ClientMonthlyReport
      debtorEntityId={3}
      debtorName="Deudor Uno"
      from="2026-09-01"
      to="2026-09-30"
      onRangeChange={vi.fn()}
      creditorNames={new Map([[2, "Acreedor Uno"]])}
      onExportPdf={vi.fn()}
      onSuccessToast={onSuccessToast}
    />,
  );
  return { onSuccessToast };
};

describe("ClientMonthlyReport payment cancellation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useClientStatementSummary.mockReturnValue({
      data: summaryWith(paymentMovement),
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mocks.usePaymentApplications.mockReturnValue({
      data: [
        application({ accountsPayableId: 11, appliedAmount: 400 }),
        application({ accountsPayableId: 12, appliedAmount: 300 }),
      ],
      isLoading: false,
    });
    mocks.useCancelPayment.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("offers cancel on active payment movements and marks cancelled ones", () => {
    renderReport();
    expect(
      screen.getByRole("button", { name: "Cancelar pago" }),
    ).toBeInTheDocument();
  });

  it("marks cancelled payments without a cancel action", () => {
    mocks.useClientStatementSummary.mockReturnValue({
      data: summaryWith({ ...paymentMovement, paymentStatus: "CANCELLED" }),
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderReport();

    expect(screen.getByText("Cancelado")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancelar pago" }),
    ).not.toBeInTheDocument();
  });

  it("shows the impact and only cancels after confirmation", () => {
    const cancelMutate = vi.fn();
    mocks.useCancelPayment.mockReturnValue({
      mutate: cancelMutate,
      isPending: false,
    });

    renderReport();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar pago" }));

    expect(
      screen.getByText(/Se reactivarán 2 deudas por \$700\.00 total/),
    ).toBeInTheDocument();
    expect(screen.getByText(/folio DEP-700/)).toBeInTheDocument();
    expect(cancelMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Sí, cancelar/ }));

    expect(cancelMutate).toHaveBeenCalledWith(77, expect.any(Object));
  });

  it("notifies success after cancelling", () => {
    mocks.useCancelPayment.mockReturnValue({
      mutate: (_id: number, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      },
      isPending: false,
    });

    const { onSuccessToast } = renderReport();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar pago" }));
    fireEvent.click(screen.getByRole("button", { name: /Sí, cancelar/ }));

    expect(onSuccessToast).toHaveBeenCalledWith(
      "Pago cancelado · folio DEP-700",
    );
  });
});
