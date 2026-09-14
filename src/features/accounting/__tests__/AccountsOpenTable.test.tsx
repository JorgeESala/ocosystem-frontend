import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentProps } from "react";
import { AccountsOpenTable } from "../components/AccountsOpenTable";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";

vi.mock("@/features/accounting/api/solicitor.queries", () => ({
  useSolicitors: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/features/accounting/api/accounts-payable.queries", () => ({
  useUpdateAccountsPayableSolicitor: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

const row = (
  overrides: Partial<AccountsPayableResponse> = {},
): AccountsPayableResponse => ({
  id: 1,
  creditorId: 2,
  creditorName: "Acreedor Uno",
  debtorId: 3,
  debtorName: "Deudor Uno",
  totalAmount: 500,
  balance: 500,
  date: "2026-09-01",
  note: "",
  ...overrides,
});

const renderTable = (
  data: AccountsPayableResponse[],
  props: Partial<ComponentProps<typeof AccountsOpenTable>> = {},
) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AccountsOpenTable data={data} onPay={vi.fn()} {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AccountsOpenTable saldo a favor chip", () => {
  it("muestra el chip cuando la cuenta tiene saldo a favor del par", () => {
    renderTable([row({ availableCredit: 250 })]);

    expect(screen.getByText(/Saldo a favor \$250\.00/)).toBeInTheDocument();
  });

  it("no muestra el chip cuando no hay saldo a favor", () => {
    renderTable([row()]);

    expect(screen.queryByText(/Saldo a favor/)).not.toBeInTheDocument();
  });
});

describe("AccountsOpenTable cuentas liquidadas", () => {
  it("marca la cuenta liquidada y oculta el botón de pago", () => {
    renderTable([row({ id: 9, balance: 0 })]);

    expect(screen.getByText("Liquidada")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Registrar pago" }),
    ).not.toBeInTheDocument();
  });

  it("mantiene el botón de pago en cuentas con saldo", () => {
    renderTable([row({ id: 10, balance: 250 })]);

    expect(screen.queryByText("Liquidada")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar pago" }),
    ).toBeInTheDocument();
  });

  it("deshabilita la selección de cuentas liquidadas", () => {
    renderTable([row({ id: 11, balance: 0 }), row({ id: 12, balance: 100 })], {
      selectable: true,
      selectedIds: [],
      onSelectionChange: vi.fn(),
    });

    expect(screen.getByLabelText("Seleccionar cuenta 11")).toBeDisabled();
    expect(screen.getByLabelText("Seleccionar cuenta 12")).toBeEnabled();
  });
});
