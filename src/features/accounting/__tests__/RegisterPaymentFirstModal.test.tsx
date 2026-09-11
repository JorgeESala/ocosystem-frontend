import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RegisterPaymentFirstModal } from "../components/RegisterPaymentFirstModal";

const mocks = vi.hoisted(() => ({
  previewFifoPayment: vi.fn(),
  createFifoPayment: vi.fn(),
  createAdvancePayment: vi.fn(),
  createPayment: vi.fn(),
  createCompensationPaymentFromAP: vi.fn(),
}));

vi.mock("@/features/accounting/api/payments.api", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/accounting/api/payments.api")
    >();
  return {
    ...actual,
    previewFifoPayment: mocks.previewFifoPayment,
    createFifoPayment: mocks.createFifoPayment,
    createAdvancePayment: mocks.createAdvancePayment,
    createPayment: mocks.createPayment,
    createCompensationPaymentFromAP: mocks.createCompensationPaymentFromAP,
  };
});

vi.mock("@/features/employee/api/employees.queries", () => ({
  useDrivers: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/features/accounting/api/accounting-entities.queries", () => ({
  useAccountingEntities: vi.fn(() => ({
    data: [
      { id: 1, name: "CEDIS A", entityType: "EGGCEDIS", entityId: 10 },
      { id: 2, name: "Proveedor B", entityType: "SUPPLIER", entityId: 20 },
    ],
  })),
}));

const previewWithDebts = {
  items: [
    {
      accountsPayableId: 11,
      debtorName: "Deudor Uno",
      creditorName: "Acreedor Uno",
      date: "2026-09-01",
      balance: 400,
      applyAmount: 400,
    },
    {
      accountsPayableId: 12,
      debtorName: "Deudor Dos",
      creditorName: "Acreedor Dos",
      date: "2026-09-02",
      balance: 500,
      applyAmount: 300,
    },
  ],
  totalApplied: 700,
  parkedAmount: 300,
};

const renderModal = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <RegisterPaymentFirstModal
        open
        onClose={vi.fn()}
        side="RECEIVABLE"
        allowCompensation
        primaryAccounts={[]}
        secondaryAccounts={[]}
        primaryLoading={false}
        secondaryLoading={false}
      />
    </QueryClientProvider>,
  );
};

const fillAdvanceForm = (amount: string) => {
  fireEvent.click(screen.getByLabelText("Anticipo (saldo a favor)"));
  fireEvent.change(screen.getByRole("spinbutton"), {
    target: { value: amount },
  });
  fireEvent.change(screen.getByDisplayValue("Selecciona quien paga"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByDisplayValue("Selecciona quien recibe"), {
    target: { value: "2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Registrar pago" }));
};

describe("RegisterPaymentFirstModal anticipo preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the oldest-first breakdown and only applies the FIFO payment on confirmation", async () => {
    mocks.previewFifoPayment.mockResolvedValue({ data: previewWithDebts });

    renderModal();
    fillAdvanceForm("1000");

    expect(
      await screen.findByText(
        /se aplicaría así, de la deuda más antigua/i,
        undefined,
        { timeout: 10000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Deudor Uno/)).toBeInTheDocument();
    expect(screen.getByText(/Deudor Dos/)).toBeInTheDocument();
    expect(screen.getByText(/Quedarían/)).toBeInTheDocument();
    expect(mocks.previewFifoPayment).toHaveBeenCalledTimes(1);
    expect(mocks.createFifoPayment).not.toHaveBeenCalled();
    expect(mocks.createAdvancePayment).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar a estas deudas" }),
    );

    await waitFor(
      () => expect(mocks.createFifoPayment).toHaveBeenCalledTimes(1),
      { timeout: 10000 },
    );
    expect(mocks.createAdvancePayment).not.toHaveBeenCalled();
  });

  it("registers the advance as parked credit only when chosen explicitly", async () => {
    mocks.previewFifoPayment.mockResolvedValue({ data: previewWithDebts });

    renderModal();
    fillAdvanceForm("1000");

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Solo registrar como saldo a favor",
        },
        { timeout: 10000 },
      ),
    );

    await waitFor(
      () => expect(mocks.createAdvancePayment).toHaveBeenCalledTimes(1),
      { timeout: 10000 },
    );
    expect(mocks.createFifoPayment).not.toHaveBeenCalled();
  });

  it("skips the breakdown when there are no open debts", async () => {
    mocks.previewFifoPayment.mockResolvedValue({
      data: { items: [], totalApplied: 0, parkedAmount: 500 },
    });

    renderModal();
    fillAdvanceForm("500");

    expect(
      await screen.findByText(/No hay deudas abiertas/i, undefined, {
        timeout: 10000,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Aplicar a estas deudas" }),
    ).not.toBeInTheDocument();
    expect(mocks.createAdvancePayment).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Solo registrar como saldo a favor",
      }),
    );

    await waitFor(
      () => expect(mocks.createAdvancePayment).toHaveBeenCalledTimes(1),
      { timeout: 10000 },
    );
    expect(mocks.createFifoPayment).not.toHaveBeenCalled();
  });
});
