import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EggCashFlowPage from "../pages/EggCashFlowPage";

vi.mock("@/core/client/api/client.queries", () => ({
  useClients: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
}));

const mocks = vi.hoisted(() => ({
  useCashFlowSettings: vi.fn(),
  useCashFlowSummary: vi.fn(),
  useCashFlowMovements: vi.fn(),
  useTripSuggestions: vi.fn(),
  useCollectionSuggestions: vi.fn(),
  useRemesas: vi.fn(),
  useAvailableExpenses: vi.fn(),
  useCashFlowCuts: vi.fn(),
  useCreateCashFlowSettings: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUpdateCashFlowSettings: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useCreateCashFlowIncome: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCreateCashFlowDeposit: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useCreateCashFlowExpense: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useCreateCashFlowRemesaPayment: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useCreateCashFlowAdjustment: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useCreateCashFlowCut: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteCashFlowMovement: vi.fn(() => ({ mutate: vi.fn() })),
  useMoveCashFlowMovement: vi.fn(() => ({ mutate: vi.fn() })),
  useDeleteCashFlowCut: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("../api/eggCashFlow.queries", () => ({
  useCashFlowSettings: mocks.useCashFlowSettings,
  useCashFlowSummary: mocks.useCashFlowSummary,
  useCashFlowMovements: mocks.useCashFlowMovements,
  useTripSuggestions: mocks.useTripSuggestions,
  useCollectionSuggestions: mocks.useCollectionSuggestions,
  useRemesas: mocks.useRemesas,
  useAvailableExpenses: mocks.useAvailableExpenses,
  useCashFlowCuts: mocks.useCashFlowCuts,
  useCreateCashFlowSettings: mocks.useCreateCashFlowSettings,
  useUpdateCashFlowSettings: mocks.useUpdateCashFlowSettings,
  useCreateCashFlowIncome: mocks.useCreateCashFlowIncome,
  useCreateCashFlowDeposit: mocks.useCreateCashFlowDeposit,
  useCreateCashFlowExpense: mocks.useCreateCashFlowExpense,
  useCreateCashFlowRemesaPayment: mocks.useCreateCashFlowRemesaPayment,
  useCreateCashFlowAdjustment: mocks.useCreateCashFlowAdjustment,
  useCreateCashFlowCut: mocks.useCreateCashFlowCut,
  useDeleteCashFlowMovement: mocks.useDeleteCashFlowMovement,
  useMoveCashFlowMovement: mocks.useMoveCashFlowMovement,
  useDeleteCashFlowCut: mocks.useDeleteCashFlowCut,
}));

const emptyQuery = <T,>(data: T = undefined as T) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
});

const mutationQuery = {
  data: {},
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/business/huevo/cash-flow"]}>
      <Routes>
        <Route
          path="/business/:slug/cash-flow"
          element={<EggCashFlowPage unitType="EGG" />}
        />
      </Routes>
    </MemoryRouter>,
  );

describe("EggCashFlowPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCashFlowSummary.mockReturnValue(emptyQuery());
    mocks.useCashFlowMovements.mockReturnValue(emptyQuery([]));
    mocks.useTripSuggestions.mockReturnValue(emptyQuery([]));
    mocks.useCollectionSuggestions.mockReturnValue(emptyQuery([]));
    mocks.useRemesas.mockReturnValue(emptyQuery([]));
    mocks.useAvailableExpenses.mockReturnValue(emptyQuery([]));
    mocks.useCashFlowCuts.mockReturnValue(emptyQuery([]));
  });

  it("shows an error alert when settings fail to load, not the onboarding screen", () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...emptyQuery(),
      data: null,
      isError: true,
      error: new Error("boom"),
    });

    renderPage();

    expect(
      screen.getByText(/No se pudo cargar la configuración/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Configura tu flujo de efectivo/),
    ).not.toBeInTheDocument();
  });

  it("shows the onboarding screen only when settings are absent without error", () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: null,
      isError: false,
      isLoading: false,
    });

    renderPage();

    expect(
      screen.getByText(/Configura tu flujo de efectivo/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/No se pudo cargar la configuración/),
    ).not.toBeInTheDocument();
  });

  it("shows an error alert instead of a false empty state when movements fail", () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: {
        id: 1,
        cashOpeningBalance: 0,
        bankOpeningBalance: 0,
        accountHolder: "Titular",
        trackingStartDate: "2026-10-01",
        createdAt: "2026-10-01T00:00:00",
        updatedAt: null,
        updatedBy: null,
      },
      isError: false,
      isLoading: false,
    });
    mocks.useCashFlowSummary.mockReturnValue(emptyQuery());
    mocks.useCashFlowMovements.mockReturnValue({
      ...emptyQuery([]),
      isError: true,
      error: new Error("movements down"),
    });

    renderPage();

    expect(
      screen.getByText(/No se pudieron cargar los movimientos/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/No hay movimientos en este periodo/),
    ).not.toBeInTheDocument();
  });
});
