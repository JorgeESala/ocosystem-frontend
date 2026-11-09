import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EggCashFlowPage from "../pages/EggCashFlowPage";
import type {
  CashFlowCut,
  TripSettlement,
  WeeklyClosePreview,
} from "../types/eggCashFlow.types";

vi.mock("@/core/client/api/client.queries", () => ({
  useClients: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
}));

const mocks = vi.hoisted(() => ({
  useCashFlowSettings: vi.fn(),
  useCashFlowSummary: vi.fn(),
  useCashFlowMovements: vi.fn(),
  useTripSettlements: vi.fn(),
  useWeeklyClose: vi.fn(),
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
  useConfirmTripSettlements: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useConfirmWeeklyClose: vi.fn(() => ({
    mutate: vi.fn(),
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
  useTripSettlements: mocks.useTripSettlements,
  useWeeklyClose: mocks.useWeeklyClose,
  useCollectionSuggestions: mocks.useCollectionSuggestions,
  useRemesas: mocks.useRemesas,
  useAvailableExpenses: mocks.useAvailableExpenses,
  useCashFlowCuts: mocks.useCashFlowCuts,
  useCreateCashFlowSettings: mocks.useCreateCashFlowSettings,
  useUpdateCashFlowSettings: mocks.useUpdateCashFlowSettings,
  useCreateCashFlowIncome: mocks.useCreateCashFlowIncome,
  useConfirmTripSettlements: mocks.useConfirmTripSettlements,
  useConfirmWeeklyClose: mocks.useConfirmWeeklyClose,
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
  weeklyCashTarget: 1000,
  directDepositClientIds: [],
  createdAt: "2026-10-01T00:00:00",
  updatedAt: null,
  updatedBy: null,
};

const settlement = (
  overrides: Partial<TripSettlement> = {},
): TripSettlement => ({
  tripId: 1,
  departureDate: "2026-10-05",
  driverId: 1,
  driverName: "Chofer Uno",
  routeId: 1,
  routeName: "Ruta Uno",
  total: 1000,
  bankPosted: 0,
  officePosted: 0,
  officeAmount: 0,
  pending: 1000,
  status: "PENDING",
  editable: true,
  weekClosed: false,
  ...overrides,
});

const weeklyPreview = (
  overrides: Partial<WeeklyClosePreview> = {},
): WeeklyClosePreview => ({
  settlementId: null,
  from: "2026-10-31",
  to: "2026-11-06",
  selectedTripId: 1,
  selectedTripDate: "2026-11-06",
  selectedTripDriverName: "Chofer Uno",
  selectedTripRouteName: "Ruta Uno",
  selectedTripTotal: 4000,
  selectedTripOfficePosted: 0,
  routeCashTotal: 4000,
  targetOfficeCash: 1000,
  currentOfficeCash: 300,
  baseOfficeCash: 300,
  requiredRetention: 700,
  retainedAmount: 700,
  shortfall: 0,
  priorExcessDeposit: 0,
  projectedOfficeCash: 1000,
  expensesTotal: 2500,
  payrollTotal: 2000,
  hasPayroll: true,
  recorded: false,
  depositTransferGroup: null,
  ...overrides,
});

const cut = (overrides: Partial<CashFlowCut> = {}): CashFlowCut => ({
  id: 1,
  weekStart: "2026-09-26",
  weekEnd: "2026-10-02",
  cashOpeningBalance: 0,
  cashClosingBalance: 0,
  bankOpeningBalance: 16679.18,
  bankClosingBalance: 8306.18,
  totalIncome: 108127,
  totalBankIncome: 0,
  totalCollections: 108127,
  totalCashAdjustments: 0,
  totalCashExpenses: 0,
  totalDeposits: 108127,
  totalRemesaPayments: 0,
  remesaDebtTotal: 95720.88,
  realBankBalance: 8306.18,
  realCashBalance: 0,
  bankDifference: 0,
  cashDifference: 0,
  note: "Excel SEP 26- 2 OCT",
  createdBy: 1,
  createdAt: "2026-10-26T00:00:00",
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
    mocks.useTripSettlements.mockReturnValue(emptyQuery([]));
    mocks.useWeeklyClose.mockReturnValue(emptyQuery());
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
    expect(screen.getByRole("link", { name: "Ayuda" })).toHaveAttribute(
      "href",
      "/business/huevo/cash-flow/help",
    );
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
    expect(screen.getByRole("link", { name: "Ayuda" })).toHaveAttribute(
      "href",
      "/business/huevo/cash-flow/help",
    );
    expect(screen.getByRole("link", { name: "Ver ayuda" })).toHaveAttribute(
      "href",
      "/business/huevo/cash-flow/help",
    );
    expect(mocks.useWeeklyClose).toHaveBeenLastCalledWith(
      "EGG",
      expect.any(String),
      expect.any(String),
      null,
      false,
    );
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
        weeklyCashTarget: 1000,
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

  it("shows the cash trip settlement calculated from sales", () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useTripSettlements.mockReturnValue(
      emptyQuery([
        settlement({ tripId: 1, driverName: "Chofer Pendiente" }),
        settlement({
          tripId: 2,
          driverName: "Chofer Parcial",
          bankPosted: 400,
          pending: 600,
          status: "PARTIAL",
        }),
      ]),
    );

    renderPage();

    expect(screen.getAllByText(/Chofer Pendiente/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chofer Parcial/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /Confirmar todos \(2\)/ }),
    ).toBeInTheDocument();
  });

  it("confirms all pending settlements with the office amount", () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useTripSettlements.mockReturnValue(
      emptyQuery([
        settlement({ tripId: 1, driverName: "Chofer Uno" }),
        settlement({
          tripId: 2,
          driverName: "Chofer Dos",
          departureDate: "2026-10-06",
          pending: 500,
          total: 500,
        }),
      ]),
    );
    const mutate = vi.fn();
    mocks.useConfirmTripSettlements.mockReturnValue({
      mutate,
      isPending: false,
    });

    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /Confirmar todos \(2\)/ }),
    );

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      {
        items: [
          { tripId: 1, officeAmount: 0 },
          { tripId: 2, officeAmount: 0 },
        ],
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("shows the backend error when confirming settlements fails", async () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useTripSettlements.mockReturnValue(
      emptyQuery([
        settlement({ tripId: 1, driverName: "Chofer Uno" }),
        settlement({ tripId: 2, driverName: "Chofer Dos" }),
      ]),
    );
    const message =
      "La fecha del despacho es anterior al inicio de Flujo de efectivo.";
    const mutate = vi.fn(
      (_payload: unknown, options?: { onError?: (error: unknown) => void }) => {
        options?.onError?.(new Error(message));
      },
    );
    mocks.useConfirmTripSettlements.mockReturnValue({
      mutate,
      isPending: false,
    });

    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /Confirmar todos \(2\)/ }),
    );

    expect((await screen.findAllByText(message)).length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("includes the trip context in the fixed error toast", async () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useTripSettlements.mockReturnValue(
      emptyQuery([settlement({ tripId: 1, driverName: "Chofer Uno" })]),
    );
    const message =
      "La fecha del despacho es anterior al inicio de Flujo de efectivo.";
    const mutate = vi.fn(
      (_payload: unknown, options?: { onError?: (error: unknown) => void }) => {
        options?.onError?.(new Error(message));
      },
    );
    mocks.useConfirmTripSettlements.mockReturnValue({
      mutate,
      isPending: false,
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(
      await screen.findByText(/Chofer Uno: La fecha del despacho/),
    ).toBeInTheDocument();
  });

  it("confirms the Friday close with the selected trip", async () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useTripSettlements.mockReturnValue(
      emptyQuery([settlement({ tripId: 1 })]),
    );
    mocks.useWeeklyClose.mockReturnValue(emptyQuery(weeklyPreview()));
    const mutate = vi.fn();
    mocks.useConfirmWeeklyClose.mockReturnValue({
      mutate,
      isPending: false,
    });

    renderPage();

    const button = screen.getByRole("button", { name: "Cerrar viernes" });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);

    expect(mutate).toHaveBeenCalledWith(
      {
        from: expect.any(String),
        to: expect.any(String),
        retentionTripId: 1,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("gates the weekly close request to settings and the cash view", () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });

    renderPage();

    expect(mocks.useWeeklyClose).toHaveBeenLastCalledWith(
      "EGG",
      expect.any(String),
      expect.any(String),
      null,
      true,
    );

    fireEvent.click(screen.getByRole("button", { name: "Solo crédito" }));

    expect(mocks.useWeeklyClose).toHaveBeenLastCalledWith(
      "EGG",
      expect.any(String),
      expect.any(String),
      null,
      false,
    );
  });

  it("hides cash settlements when only credit is selected", () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useTripSettlements.mockReturnValue(
      emptyQuery([settlement({ driverName: "Chofer Efectivo" })]),
    );

    renderPage();

    expect(screen.getByText("Cobranza de ruta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Solo crédito" }));

    expect(screen.queryByText("Cobranza de ruta")).not.toBeInTheDocument();
    expect(screen.getByText("Cobros por registrar")).toBeInTheDocument();
  });

  it("opens on the latest cut week when cuts exist", async () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useCashFlowCuts.mockReturnValue(emptyQuery([cut()]));
    mocks.useCashFlowMovements.mockReturnValue(emptyQuery([]));

    renderPage();

    await waitFor(() =>
      expect(mocks.useCashFlowSummary).toHaveBeenLastCalledWith(
        "EGG",
        "2026-09-26",
        "2026-10-02",
      ),
    );
  });

  it("jumps to the full cut period with the button", async () => {
    mocks.useCashFlowSettings.mockReturnValue({
      ...mutationQuery,
      data: settingsData,
      isLoading: false,
    });
    mocks.useCashFlowCuts.mockReturnValue(
      emptyQuery([
        cut({ id: 2 }),
        cut({ id: 1, weekStart: "2026-08-22", weekEnd: "2026-08-28" }),
      ]),
    );
    mocks.useCashFlowMovements.mockReturnValue(emptyQuery([]));

    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /Ver periodo de cortes/ }),
    );

    await waitFor(() =>
      expect(mocks.useCashFlowSummary).toHaveBeenLastCalledWith(
        "EGG",
        "2026-08-22",
        "2026-10-02",
      ),
    );
  });
});
