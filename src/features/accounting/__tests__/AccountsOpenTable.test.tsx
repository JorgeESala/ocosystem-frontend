import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const renderTable = (data: AccountsPayableResponse[]) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AccountsOpenTable data={data} onPay={vi.fn()} />
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
