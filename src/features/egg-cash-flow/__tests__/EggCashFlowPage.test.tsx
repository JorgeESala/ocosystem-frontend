import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EggCashFlowPage from "../pages/EggCashFlowPage";
import type { TripSuggestion } from "../types/eggCashFlow.types";

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
  useRegisterAllCashFlowIncome: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  })),
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
  useRegisterAllCashFlowIncome: mocks.useRegisterAllCashFlowIncome,
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

const settingsData = {
  id: 1,
  cashOpeningBalance: 0,
  bankOpeningBalance: 0,
  accountHolder: "Titular",
  trackingStartDate: "2026-10-01",
  directDepositClientIds: [],
  createdAt: "2026-10-01T00:00:00",
  updatedAt: null,
  updatedBy: null,
};

const trip = (overrides: Partial<TripSuggestion> = {}): TripSuggestion => ({
  tripId: 1,
  departureDate: "2026-10-05",
  driverId: 1,
  driverName: "Chofer Uno",
  routeId: 1,
  collectible: 1000,
  collected: 0,
  pending: 1000,
  ...overrides,
});

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

  it("does not offer trips that already have a partial collection", () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useTripSuggestions.mockReturnValue(
      emptyQuery([
        trip({ tripId: 1, driverName: "Chofer Pendiente" }),
        trip({
          tripId: 2,
          driverName: "Chofer Parcial",
          collected: 400,
          pending: 600,
        }),
      ]),
    );

    renderPage();

    expect(screen.getByText(/Chofer Pendiente/)).toBeInTheDocument();
    expect(screen.queryByText(/Chofer Parcial/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Registrar todo \(1\)/ }),
    ).toBeInTheDocument();
  });

  it("registers pending trips and summarizes failures", async () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useTripSuggestions.mockReturnValue(
      emptyQuery([
        trip({ tripId: 1, driverName: "Chofer Uno" }),
        trip({
          tripId: 2,
          driverName: "Chofer Dos",
          departureDate: "2026-10-06",
          pending: 500,
        }),
      ]),
    );
    const mutateAsync = vi.fn().mockResolvedValue({
      registered: 1,
      failed: [
        {
          trip: trip({
            tripId: 2,
            driverName: "Chofer Dos",
            departureDate: "2026-10-06",
            pending: 500,
          }),
          error: new Error("Esta fecha esta dentro de una semana cerrada."),
        },
      ],
    });
    mocks.useRegisterAllCashFlowIncome.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
    });

    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /Registrar todo \(2\)/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Si, registrar/ }));

    expect(
      await screen.findByText(/1 despacho registrado/),
    ).toBeInTheDocument();
    expect(screen.getByText(/semana cerrada/)).toBeInTheDocument();
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ tripId: 1 }),
        expect.objectContaining({ tripId: 2 }),
      ]),
    );
  });
});
