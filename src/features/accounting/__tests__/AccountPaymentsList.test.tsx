import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccountPaymentsList } from "../components/AccountPaymentsList";
import type {
  PaymentApplication,
  PaymentResponse,
} from "../types/payment.types";

const mocks = vi.hoisted(() => ({
  usePairPayments: vi.fn(),
  useCancelPayment: vi.fn(),
  usePaymentApplications: vi.fn(),
}));

vi.mock("@/features/accounting/api/payments.queries", () => ({
  usePairPayments: mocks.usePairPayments,
  useCancelPayment: mocks.useCancelPayment,
  usePaymentApplications: mocks.usePaymentApplications,
}));

const activePayment: PaymentResponse = {
  id: 1,
  amount: 1000,
  remainingAmount: 300,
  paymentDate: "2026-09-05",
  paymentMethod: "BANK_TRANSFER",
  folio: "DEP-001",
  status: "ACTIVE",
  createdAt: "2026-09-05T10:00:00",
};

const cancelledPayment: PaymentResponse = {
  id: 2,
  amount: 500,
  remainingAmount: 0,
  paymentDate: "2026-09-04",
  paymentMethod: "CASH",
  folio: "DEP-002",
  status: "CANCELLED",
  createdAt: "2026-09-04T10:00:00",
};

const application = (
  overrides: Partial<PaymentApplication> = {},
): PaymentApplication => ({
  accountsPayableId: 11,
  appliedAmount: 100,
  date: "2026-09-01",
  ...overrides,
});

describe("AccountPaymentsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCancelPayment.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mocks.usePaymentApplications.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it("muestra pagos activos y cancelados con su reparto aplicado/saldo a favor", () => {
    mocks.usePairPayments.mockReturnValue({
      data: [activePayment, cancelledPayment],
      isLoading: false,
    });

    render(<AccountPaymentsList payerId={1} receiverId={2} />);

    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Cancelado")).toBeInTheDocument();
    expect(
      screen.getByText(/Aplicado \$700\.00 · Saldo a favor \$300\.00/),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Saldo a favor \$300\.00/).length,
    ).toBeGreaterThan(1);
    expect(
      screen.getByText(/Aplicado \$500\.00 · Saldo a favor \$0\.00/),
    ).toBeInTheDocument();
  });

  it("expande el desglose por deuda desde el endpoint de aplicaciones", () => {
    mocks.usePairPayments.mockReturnValue({
      data: [activePayment],
      isLoading: false,
    });
    mocks.usePaymentApplications.mockReturnValue({
      data: [
        application({
          accountsPayableId: 11,
          appliedAmount: 500,
          sourceType: "BATCH",
          sourceBatchId: 123,
        }),
        application({
          accountsPayableId: 12,
          appliedAmount: 200,
          sourceType: "DELIVERY",
          sourceBatchId: 456,
        }),
      ],
      isLoading: false,
    });

    render(<AccountPaymentsList payerId={1} receiverId={2} />);
    fireEvent.click(screen.getByRole("button", { name: /Ver desglose/ }));

    expect(screen.getByText(/Remesa #123 · \$500\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Venta #456 · \$200\.00/)).toBeInTheDocument();
  });

  it("pide confirmación con impacto antes de cancelar el pago", () => {
    const cancelMutate = vi.fn();
    mocks.useCancelPayment.mockReturnValue({
      mutate: cancelMutate,
      isPending: false,
    });
    mocks.usePairPayments.mockReturnValue({
      data: [activePayment],
      isLoading: false,
    });
    mocks.usePaymentApplications.mockReturnValue({
      data: [
        application({ accountsPayableId: 11, appliedAmount: 400 }),
        application({ accountsPayableId: 12, appliedAmount: 300 }),
      ],
      isLoading: false,
    });

    render(<AccountPaymentsList payerId={1} receiverId={2} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar pago" }));

    expect(
      screen.getByText(/Se reactivarán 2 deudas por \$700\.00 total/),
    ).toBeInTheDocument();
    expect(screen.getByText(/folio DEP-001/)).toBeInTheDocument();
    expect(cancelMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Sí, cancelar/ }));

    expect(cancelMutate).toHaveBeenCalledWith(1, expect.any(Object));
  });
});
