import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UnitGeneralCashPage from "../pages/UnitGeneralCashPage";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  const { MockResponsiveContainer } = await import("@/test/rechartsMock");
  return {
    ...actual,
    ResponsiveContainer: MockResponsiveContainer,
  };
});

const mocks = vi.hoisted(() => ({
  useUnitCashAccount: vi.fn(),
  useUnitCashAlerts: vi.fn(),
  useUnitCashFlow: vi.fn(),
  useCreateUnitCash: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateUnitCash: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRecalculateUnitCash: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUnitCashHistory: vi.fn(() => ({ data: [], isLoading: false })),
  useUnitCashAdjustments: vi.fn(() => ({ data: [] })),
  useCreateUnitCashAdjustment: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUpdateUnitCashAdjustment: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useDeleteUnitCashAdjustment: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("../api/unitCash.queries", () => ({
  useUnitCashAccount: mocks.useUnitCashAccount,
  useUnitCashAlerts: mocks.useUnitCashAlerts,
  useUnitCashFlow: mocks.useUnitCashFlow,
  useCreateUnitCash: mocks.useCreateUnitCash,
  useUpdateUnitCash: mocks.useUpdateUnitCash,
  useRecalculateUnitCash: mocks.useRecalculateUnitCash,
  useUnitCashHistory: mocks.useUnitCashHistory,
  useUnitCashAdjustments: mocks.useUnitCashAdjustments,
  useCreateUnitCashAdjustment: mocks.useCreateUnitCashAdjustment,
  useUpdateUnitCashAdjustment: mocks.useUpdateUnitCashAdjustment,
  useDeleteUnitCashAdjustment: mocks.useDeleteUnitCashAdjustment,
}));

const renderPage = (unitType: "EGG" | "LIVE_CHICKEN" = "EGG") =>
  render(
    <MemoryRouter initialEntries={["/business/huevo/general-cash"]}>
      <Routes>
        <Route
          path="/business/:slug/general-cash"
          element={<UnitGeneralCashPage unitType={unitType} />}
        />
      </Routes>
    </MemoryRouter>,
  );

const account = {
  id: 1,
  startingBalance: 1000,
  currentBalance: 1500,
  alertThreshold: 100,
  lastCalculatedAt: "2026-09-20T10:00:00",
};

describe("UnitGeneralCashPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useUnitCashAlerts.mockReturnValue({ data: [] });
    mocks.useUnitCashFlow.mockReturnValue({ data: undefined });
  });

  it("shows the empty state when the cash box does not exist yet", () => {
    mocks.useUnitCashAccount.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(
      screen.getByText("Aun no hay caja general de Huevo"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Crear caja general/i }),
    ).toBeInTheDocument();
  });

  it("shows the balance when the cash box exists", () => {
    mocks.useUnitCashAccount.mockReturnValue({
      data: account,
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getAllByText(/\$1,500\.00/).length).toBeGreaterThan(0);
    expect(screen.getByText(/No hay alertas activas/)).toBeInTheDocument();
    expect(screen.getByText(/Saldo inicial: \$1,000\.00/)).toBeInTheDocument();
  });

  it("renders active alerts", () => {
    mocks.useUnitCashAccount.mockReturnValue({
      data: account,
      isLoading: false,
      isError: false,
    });
    mocks.useUnitCashAlerts.mockReturnValue({
      data: [
        {
          type: "LOW_BALANCE",
          severity: "critical",
          message: "Saldo bajo el umbral: $50.00 < $100.00",
          currentBalance: 50,
          threshold: 100,
        },
      ],
    });

    renderPage();

    expect(
      screen.getByText("Saldo bajo el umbral: $50.00 < $100.00"),
    ).toBeInTheDocument();
  });

  it("uses the live chicken label when mounted for pollo vivo", () => {
    mocks.useUnitCashAccount.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });

    renderPage("LIVE_CHICKEN");

    expect(
      screen.getByText("Aun no hay caja general de Pollo vivo"),
    ).toBeInTheDocument();
  });
});
