import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClientCollectionPanel } from "../components/collections/ClientCollectionPanel";
import { toLocalDateString } from "@/utils/date.utils";
import type { PaymentResponse } from "../types/payment.types";

const mocks = vi.hoisted(() => ({
  useClients: vi.fn(),
  useOpenAccounts: vi.fn(),
  useSameDayPayments: vi.fn(),
  useUnappliedPayments: vi.fn(),
  applyCreditsMutate: vi.fn(),
  createPaymentMutate: vi.fn(),
  lastPayload: null as Record<string, unknown> | null,
}));

vi.mock("@/core/client/api/client.queries", () => ({
  useClients: mocks.useClients,
}));

vi.mock("../api/accounts-payable.queries", () => ({
  useOpenAccounts: mocks.useOpenAccounts,
}));

vi.mock("@/features/egg-cash-flow/api/eggCashFlow.queries", () => ({
  useCollectionAvailability: () => ({
    data: { writable: true, reason: "OK", message: null },
  }),
  useCashFlowSettings: () => ({
    data: { directDepositClientIds: [] },
  }),
}));

vi.mock("../api/payments.queries", () => ({
  useCreateFifoPayment: () => ({
    mutate: mocks.createPaymentMutate,
    isPending: false,
  }),
  useSameDayPayments: mocks.useSameDayPayments,
  useUnappliedPayments: mocks.useUnappliedPayments,
  useApplyCreditsToAccount: () => ({
    mutate: mocks.applyCreditsMutate,
    isPending: false,
  }),
}));

const creditClient = {
  id: 1,
  name: "Doña María",
  businessName: "Abarrotes María",
  phone: "555-100-2000",
  accountingEntityId: 88,
  isInternalBranch: false,
  isInternalClient: false,
  localityName: "Centro",
  active: true,
};

const cashClient = {
  id: 2,
  name: "Tienda Efectivo",
  accountingEntityId: null,
  isInternalBranch: false,
  isInternalClient: false,
  active: true,
};

const debts = [
  {
    id: 11,
    debtorId: 88,
    debtorName: "Doña María",
    creditorId: 1,
    creditorName: "CEDIS Norte",
    totalAmount: 500,
    balance: 500,
    date: "2026-09-01",
    note: "",
  },
  {
    id: 12,
    debtorId: 88,
    debtorName: "Doña María",
    creditorId: 1,
    creditorName: "CEDIS Norte",
    totalAmount: 100,
    balance: 100,
    date: "2026-09-05",
    note: "",
  },
  {
    id: 13,
    debtorId: 88,
    debtorName: "Doña María",
    creditorId: 2,
    creditorName: "CEDIS Sur",
    totalAmount: 300,
    balance: 300,
    date: "2026-09-03",
    note: "",
  },
];

const renderPanel = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const onSuccessToast = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <ClientCollectionPanel onSuccessToast={onSuccessToast} />
    </QueryClientProvider>,
  );
  return { onSuccessToast };
};

const selectCreditClient = () => {
  fireEvent.change(screen.getByLabelText("Buscar cliente"), {
    target: { value: "María" },
  });
  fireEvent.click(screen.getByText("Doña María"));
};

describe("ClientCollectionPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.lastPayload = null;
    mocks.useClients.mockReturnValue({
      data: [creditClient, cashClient],
      isLoading: false,
    });
    mocks.useOpenAccounts.mockReturnValue({
      data: debts,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mocks.useSameDayPayments.mockReturnValue({ data: [] });
    mocks.useUnappliedPayments.mockReturnValue({
      data: [],
      refetch: vi.fn(),
    });
    mocks.createPaymentMutate.mockImplementation(
      (
        payload: Record<string, unknown>,
        options: { onSuccess: (payment: PaymentResponse) => void },
      ) => {
        mocks.lastPayload = payload;
        const amount = Number(payload.amount);
        options.onSuccess({
          id: 1,
          amount,
          appliedAmount: Math.min(amount, 600),
          remainingAmount: Math.max(0, amount - 600),
          paymentDate: String(payload.paymentDate),
          paymentMethod:
            payload.paymentMethod as PaymentResponse["paymentMethod"],
          status: "ACTIVE",
          createdAt: "2026-09-01T10:00:00",
        });
      },
    );
  });

  it("blocks save when the duplicate check fails", async () => {
    mocks.useSameDayPayments.mockReturnValue({
      data: [],
      isError: true,
      isLoading: false,
      refetch: vi.fn(),
    });
    renderPanel();
    selectCreditClient();

    expect(
      await screen.findByText(/No se pudo verificar si ya existe un cobro/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar cobro" }),
    ).toBeDisabled();
  });

  it("shows available credit and applies it to the oldest debt", async () => {
    mocks.useUnappliedPayments.mockReturnValue({
      data: [{ id: 1, remainingAmount: 100 }],
      refetch: vi.fn(),
    });
    renderPanel();
    selectCreditClient();

    expect(await screen.findByText("Saldo a favor")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar a deuda más antigua" }),
    );

    expect(mocks.applyCreditsMutate).toHaveBeenCalledWith(
      11,
      expect.any(Object),
    );
  });

  it("requires a reference for non-cash payments", async () => {
    renderPanel();
    selectCreditClient();

    fireEvent.change(screen.getByLabelText("Método de pago"), {
      target: { value: "BANK_TRANSFER" },
    });

    expect(
      screen.getByRole("button", { name: "Registrar cobro" }),
    ).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Referencia/), {
      target: { value: "TRANSFER-123" },
    });
    expect(
      screen.getByRole("button", { name: "Registrar cobro" }),
    ).toBeEnabled();
  });

  it("prefills the client debt, cash and submits the payment", async () => {
    const { onSuccessToast } = renderPanel();

    selectCreditClient();

    expect(await screen.findByText("Deuda total")).toBeInTheDocument();
    expect(screen.getByText("$900.00")).toBeInTheDocument();
    expect(screen.getByLabelText("CEDIS")).toHaveValue("1");
    expect(screen.getByLabelText("Monto")).toHaveValue(900);
    expect(screen.getByLabelText("Método de pago")).toHaveValue("CASH");
    expect(screen.getByText(/Se aplicará/)).toHaveTextContent(
      "Se aplicará $600.00 · saldo a favor $300.00",
    );

    fireEvent.click(screen.getByRole("button", { name: "Registrar cobro" }));

    await waitFor(() => {
      expect(mocks.createPaymentMutate).toHaveBeenCalledTimes(1);
    });
    expect(mocks.lastPayload).toMatchObject({
      payerId: 88,
      receiverId: 1,
      amount: 900,
      paymentMethod: "CASH",
      paymentDate: toLocalDateString(new Date()),
    });
    expect(mocks.lastPayload).not.toHaveProperty("tripId");
    expect(onSuccessToast).toHaveBeenCalledWith(
      expect.stringContaining("aplicado $600.00"),
    );
    expect(screen.getByLabelText("Buscar cliente")).toHaveValue("");
    expect(screen.getByText(/Cobro registrado/)).toBeInTheDocument();
  });

  it("keeps the client debt when the manager picks another CEDIS", async () => {
    renderPanel();
    selectCreditClient();
    await screen.findByText("Deuda total");

    fireEvent.change(screen.getByLabelText("CEDIS"), {
      target: { value: "2" },
    });

    expect(screen.getByLabelText("Monto")).toHaveValue(900);
  });

  it("shows saldo a favor when the amount exceeds the selected CEDIS", async () => {
    renderPanel();
    selectCreditClient();
    await screen.findByText("Deuda total");

    fireEvent.change(screen.getByLabelText("Monto"), {
      target: { value: "750" },
    });

    expect(screen.getByText(/Se aplicará/)).toHaveTextContent(
      "Se aplicará $600.00 · saldo a favor $150.00",
    );
  });

  it("shows a clear message when the client has no open debt", async () => {
    mocks.useOpenAccounts.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    renderPanel();

    selectCreditClient();

    expect(
      await screen.findByText("Este cliente no tiene deuda abierta."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Registrar cobro" }),
    ).not.toBeInTheDocument();
  });

  it("does not offer cash-only clients in the autocomplete", () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText("Buscar cliente"), {
      target: { value: "Efectivo" },
    });

    expect(
      screen.getByText("No hay coincidencias con cuenta por cobrar"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Tienda Efectivo")).not.toBeInTheDocument();
  });

  it("warns about a same-day payment with the same amount", async () => {
    mocks.useSameDayPayments.mockReturnValue({
      data: [
        {
          id: 9,
          amount: 900,
          paymentDate: toLocalDateString(new Date()),
          paymentMethod: "CASH",
          status: "ACTIVE",
          createdAt: "2026-09-01T10:00:00",
        },
      ],
    });
    renderPanel();

    selectCreditClient();

    expect(
      await screen.findByText(/Ya existe un cobro de/),
    ).toBeInTheDocument();
  });
});
