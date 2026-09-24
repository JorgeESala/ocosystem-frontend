import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UnitCashReconciliationPanel from "../components/UnitCashReconciliationPanel";

const mocks = vi.hoisted(() => ({
  useUnitCashReconciliationPreview: vi.fn(),
  useApplyUnitCashReconciliation: vi.fn(),
}));

vi.mock("../api/unitCash.queries", () => ({
  useUnitCashReconciliationPreview: mocks.useUnitCashReconciliationPreview,
  useApplyUnitCashReconciliation: mocks.useApplyUnitCashReconciliation,
}));

const emptyPlan = {
  from: "2026-09-13",
  to: "2026-09-20",
  changes: [],
  created: 0,
  updated: 0,
  deleted: 0,
  previousBalance: 1500,
  projectedBalance: 1500,
  lastReconciledAt: "2026-09-20T10:00:00",
};

const pendingPlan = {
  ...emptyPlan,
  changes: [
    {
      changeType: "CREATE",
      sourceType: "SALE",
      sourceId: 5,
      folio: "Remesa #99",
      entryDate: "2026-09-19",
      entryType: "INCOME_SALES",
      amount: 500,
      previousAmount: null,
      description: "Venta directa",
      reason: "Movimiento faltante",
      balanceDelta: 500,
    },
    {
      changeType: "DELETE",
      sourceType: "PAYMENT",
      sourceId: 8,
      folio: "F-8",
      entryDate: "2026-09-18",
      entryType: "INCOME_SALES",
      amount: 300,
      previousAmount: null,
      description: "Cobro: Pago folio F-8",
      reason: "Pago cancelado",
      balanceDelta: -300,
    },
  ],
  created: 1,
  updated: 0,
  deleted: 1,
  projectedBalance: 1700,
};

describe("UnitCashReconciliationPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useApplyUnitCashReconciliation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("shows the synced state when there are no changes", () => {
    mocks.useUnitCashReconciliationPreview.mockReturnValue({
      data: emptyPlan,
      isLoading: false,
    });

    render(<UnitCashReconciliationPanel unit="EGG" />);

    expect(screen.getByText(/Movimientos sincronizados/)).toBeInTheDocument();
    expect(screen.queryByText(/Aplicar cambios/i)).not.toBeInTheDocument();
  });

  it("labels compensation changes", () => {
    mocks.useUnitCashReconciliationPreview.mockReturnValue({
      data: {
        ...emptyPlan,
        changes: [
          {
            changeType: "CREATE",
            sourceType: "COMPENSATION_IN",
            sourceId: 30,
            folio: "COMP-1",
            entryDate: "2026-09-19",
            entryType: "INCOME_SALES",
            amount: 1000,
            previousAmount: null,
            description: "Compensación cobro: folio COMP-1",
            reason: "Movimiento faltante",
            balanceDelta: 1000,
          },
        ],
        created: 1,
      },
      isLoading: false,
    });

    render(<UnitCashReconciliationPanel unit="EGG" />);

    expect(screen.getByText("Compensación")).toBeInTheDocument();
    expect(screen.getByText("COMP-1")).toBeInTheDocument();
  });

  it("lists pending changes with folio and applies them", () => {
    const mutate = vi.fn();
    mocks.useUnitCashReconciliationPreview.mockReturnValue({
      data: pendingPlan,
      isLoading: false,
    });
    mocks.useApplyUnitCashReconciliation.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<UnitCashReconciliationPanel unit="EGG" />);

    expect(
      screen.getByText(/Sincronización pendiente \(2\)/),
    ).toBeInTheDocument();
    expect(screen.getByText("Remesa #99")).toBeInTheDocument();
    expect(screen.getByText("F-8")).toBeInTheDocument();
    expect(screen.getByText("Pago cancelado")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Aplicar cambios/i }));
    fireEvent.click(screen.getByRole("button", { name: /Si, aplicar/i }));

    expect(mutate).toHaveBeenCalledTimes(1);
  });
});
