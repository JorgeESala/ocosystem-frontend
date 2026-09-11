import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccountDetailDrawer } from "../components/AccountDetailDrawer";
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

vi.mock("@/features/accounting/api/accounting-entities.queries", () => ({
  useAccountingEntities: vi.fn(() => ({ data: [] })),
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

vi.mock("@/features/accounting/components/AccountPaymentsList", () => ({
  AccountPaymentsList: () => <div>Pagos mock</div>,
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

  it("offers the client report as its own action in receivable mode", () => {
    const onOpenClientReport = vi.fn();
    render(
      <AccountDetailDrawer
        open
        onClose={vi.fn()}
        account={account}
        mode="RECEIVABLE"
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

  it("hides the client report action in payable mode", () => {
    render(
      <AccountDetailDrawer
        open
        onClose={vi.fn()}
        account={account}
        mode="PAYABLE"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Reporte del cliente" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the pair payments section in both modes", () => {
    const { unmount } = render(
      <AccountDetailDrawer
        open
        onClose={vi.fn()}
        account={account}
        mode="RECEIVABLE"
      />,
    );
    expect(screen.getByText("Pagos de esta cuenta")).toBeInTheDocument();
    expect(screen.getByText("Pagos mock")).toBeInTheDocument();
    unmount();

    render(
      <AccountDetailDrawer
        open
        onClose={vi.fn()}
        account={account}
        mode="PAYABLE"
      />,
    );
    expect(screen.getByText("Pagos de esta cuenta")).toBeInTheDocument();
    expect(screen.getByText("Pagos mock")).toBeInTheDocument();
  });
});
