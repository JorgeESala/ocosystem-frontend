import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccountDetailDrawer } from "../components/AccountDetailDrawer";
import {
  useApplyRemainder,
  useUnappliedPayments,
} from "../api/payments.queries";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";

vi.mock("@/features/accounting/api/movements.queries", () => ({
  useAccountsPayableMovements: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock("@/features/accounting/api/payments.queries", () => ({
  useUnappliedPayments: vi.fn(() => ({ data: [] })),
  useApplyCreditsToAccount: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useApplyRemainder: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
  useReverseApplication: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
}));

vi.mock("@/features/batch/components/BatchPreviewDrawer", () => ({
  BatchPreviewDrawer: () => null,
}));

const account: AccountsPayableResponse = {
  id: 1,
  creditorId: 2,
  creditorName: "Acreedor Uno",
  debtorId: 3,
  debtorName: "Deudor Uno",
  totalAmount: 500,
  balance: 500,
  date: "2026-09-01",
  note: "",
  sourceType: "OTHER",
};

describe("AccountDetailDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("offers the client report as its own action", () => {
    const onOpenClientReport = vi.fn();
    render(
      <AccountDetailDrawer
        open
        onClose={vi.fn()}
        account={account}
        onOpenClientReport={onOpenClientReport}
      />,
    );

    const reportButton = screen.getByRole("button", {
      name: "Reporte del cliente",
    });
    expect(reportButton).toBeInTheDocument();

    fireEvent.click(reportButton);
    expect(onOpenClientReport).toHaveBeenCalledWith(account);
  });

  it("hides the client report action without a handler", () => {
    render(<AccountDetailDrawer open onClose={vi.fn()} account={account} />);

    expect(
      screen.queryByRole("button", { name: "Reporte del cliente" }),
    ).not.toBeInTheDocument();
  });

  it("shows only the account movements list", () => {
    render(<AccountDetailDrawer open onClose={vi.fn()} account={account} />);

    expect(
      screen.getAllByText("Movimientos de esta cuenta").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Pagos de esta cuenta")).not.toBeInTheDocument();
    expect(screen.queryByText("Pagos relacionados")).not.toBeInTheDocument();
  });

  it("shows cross-cedis credits and applies them when enabled", () => {
    const applyMutate = vi.fn();
    vi.mocked(useUnappliedPayments).mockReturnValueOnce({
      data: [
        {
          id: 7,
          amount: 1000,
          remainingAmount: 1000,
          paymentDate: "2026-09-01",
          paymentMethod: "BANK_TRANSFER",
          status: "ACTIVE",
          createdAt: "2026-09-01T00:00:00",
          receiverName: "CEDIS A",
          receiverEntityId: 9,
        },
      ],
    } as never);
    vi.mocked(useApplyRemainder).mockReturnValueOnce({
      mutate: applyMutate,
      isPending: false,
      error: null,
    } as never);

    render(
      <AccountDetailDrawer
        open
        onClose={vi.fn()}
        account={account}
        allowCrossCreditor
      />,
    );

    expect(useUnappliedPayments).toHaveBeenCalledWith(3, undefined);
    expect(screen.getByText(/CEDIS A/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Aplicar a esta cuenta/ }),
    );

    expect(applyMutate).toHaveBeenCalledWith(
      { paymentId: 7, payload: { accountsPayableId: 1 } },
      expect.anything(),
    );
  });
});
