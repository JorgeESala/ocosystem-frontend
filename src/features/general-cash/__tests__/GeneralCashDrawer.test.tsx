import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import GeneralCashDrawer from "../components/GeneralCashDrawer";
import type { CashFlowHistoryDTO, CashReserveResponseDTO } from "../types";

const { mockState } = vi.hoisted(() => ({
  mockState: {
    history: [] as CashFlowHistoryDTO[],
    posTotal: { total: 0, count: 0 },
    posLoading: false,
  },
}));

vi.mock("../api/generalCash.queries", () => ({
  useCashFlowHistory: () => ({ data: mockState.history, isLoading: false }),
  useCreateCashAdjustment: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateCashAdjustment: () => ({ mutate: vi.fn(), isPending: false }),
  useCashAdjustments: () => ({ data: [], isLoading: false }),
  useDeleteCashAdjustment: () => ({ mutate: vi.fn(), isPending: false }),
  usePosReportedTotal: () => ({
    data: mockState.posTotal,
    isLoading: mockState.posLoading,
  }),
}));

const reserve: CashReserveResponseDTO = {
  id: 5,
  branchId: 9,
  branchName: "Norte",
  startingBalance: 100,
  currentBalance: 1000,
  alertThreshold: 0,
  lastCalculatedAt: null,
};

const entry = (
  overrides: Partial<CashFlowHistoryDTO> = {},
): CashFlowHistoryDTO => ({
  id: 1,
  entryDate: "2026-09-01",
  entryType: "INCOME_SALES",
  amount: 0,
  sourceType: "SALE",
  sourceId: null,
  description: null,
  runningBalance: 0,
  createdAt: "2026-09-01T10:00:00",
  ...overrides,
});

describe("GeneralCashDrawer POS filter", () => {
  beforeEach(() => {
    mockState.history = [];
    mockState.posTotal = { total: 0, count: 0 };
    mockState.posLoading = false;
  });

  it("shows the alternate balance and filters POS rows when unchecked", () => {
    mockState.history = [
      entry({
        id: 1,
        amount: 100,
        description: "Venta remesa #1",
        runningBalance: 1100,
      }),
      entry({
        id: 2,
        amount: 250,
        sourceType: "POS_REPORTED_SALES",
        description: "POS 3 tickets",
        runningBalance: 1350,
      }),
    ];
    mockState.posTotal = { total: 250, count: 1 };

    render(<GeneralCashDrawer open onClose={() => {}} reserve={reserve} />);

    expect(screen.getByText("Venta remesa #1")).toBeTruthy();
    expect(screen.getByText("POS 3 tickets")).toBeTruthy();
    expect(screen.queryByText(/Saldo sin POS/)).toBeNull();

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Mostrar ventas POS de otros productos/,
      }),
    );

    expect(screen.getByText("Venta remesa #1")).toBeTruthy();
    expect(screen.queryByText("POS 3 tickets")).toBeNull();
    expect(screen.getByText("Saldo sin POS (histórico): $750.00")).toBeTruthy();
  });

  it("hides the filter when the reserve has no POS-reported sales", () => {
    mockState.history = [
      entry({
        id: 1,
        amount: 100,
        description: "Venta remesa #1",
        runningBalance: 1100,
      }),
    ];
    mockState.posTotal = { total: 0, count: 0 };

    render(<GeneralCashDrawer open onClose={() => {}} reserve={reserve} />);

    expect(
      screen.queryByRole("checkbox", {
        name: /Mostrar ventas POS de otros productos/,
      }),
    ).toBeNull();
    expect(screen.queryByText(/Saldo sin POS/)).toBeNull();
  });
});
