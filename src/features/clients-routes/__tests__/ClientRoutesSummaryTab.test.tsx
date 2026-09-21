import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ClientRoutesSummaryTab } from "../components/ClientRoutesSummaryTab";
import { formatHumanDate, toLocalDateString } from "@/utils/date.utils";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  const { MockResponsiveContainer } = await import("@/test/rechartsMock");
  return {
    ...actual,
    ResponsiveContainer: MockResponsiveContainer,
  };
});

vi.mock("../components/DateRangeFields", () => ({
  DateRangeFields: () => (
    <div>
      <label htmlFor="mock-from">Desde</label>
      <input id="mock-from" />
      <label htmlFor="mock-to">Hasta</label>
      <input id="mock-to" />
    </div>
  ),
}));

const mocks = vi.hoisted(() => ({
  useClientRoutesSummary: vi.fn(),
  useRouteCalendar: vi.fn(),
}));

vi.mock("../api/summary.queries", () => ({
  useClientRoutesSummary: mocks.useClientRoutesSummary,
  useRouteCalendar: mocks.useRouteCalendar,
}));

const summary = {
  period: {
    from: "2030-01-01",
    to: "2030-01-31",
    previousFrom: "2029-12-01",
    previousTo: "2029-12-31",
    dormantDays: 30,
  },
  sales: {
    totalSales: 12000,
    totalQuantity: 300,
    saleCount: 20,
    cogs: 2000,
    fuelExpense: 500,
    profit: 9500,
    marginPct: 79.17,
    averageTicket: 600,
    top10SharePct: 64.5,
    previous: { totalSales: 10000, profit: 8000, marginPct: 80 },
    variation: { salesPct: 20, profitPct: 18.75, marginPoints: -0.83 },
  },
  clients: {
    active: 40,
    inactive: 5,
    withoutLocality: 2,
    withoutRoute: 3,
    neverPurchased: 7,
    dormant: 6,
    byType: {
      branchesActive: 2,
      branchesInactive: 0,
      internalActive: 5,
      internalInactive: 1,
      externalActive: 33,
      externalInactive: 4,
    },
  },
  routes: {
    active: 8,
    inactive: 1,
    withoutLocalities: 1,
    withoutActivity: 2,
  },
  topClients: [
    {
      clientId: 1,
      name: "Cliente Uno",
      businessName: "Abarrotes Uno",
      totalQuantity: 100,
      totalSales: 3000,
      saleCount: 5,
    },
  ],
  topRoutes: [
    {
      routeId: 1,
      routeName: "Ruta Centro",
      totalSales: 5000,
      profit: 4000,
      marginPct: 80,
      activeClients: 12,
    },
  ],
  routeIdsWithoutActivity: [3],
};

const calendar = [
  {
    routeId: 1,
    name: "Ruta Centro",
    deliveryDays: [1],
    activeClients: 12,
  },
];

const renderTab = (overrides = {}) => {
  const handlers = {
    onShowClientsWithoutRoute: vi.fn(),
    onShowDormantClients: vi.fn(),
    onShowRoutesWithoutActivity: vi.fn(),
    onShowRoutesWithoutLocalities: vi.fn(),
    ...overrides,
  };
  render(<ClientRoutesSummaryTab {...handlers} />);
  return handlers;
};

describe("ClientRoutesSummaryTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useClientRoutesSummary.mockReturnValue({
      data: summary,
      isLoading: false,
      isError: false,
      error: null,
    });
    mocks.useRouteCalendar.mockReturnValue({
      data: calendar,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("muestra los KPIs con variación vs periodo anterior", () => {
    renderTab();

    const kpis = within(screen.getByTestId("summary-kpis"));
    expect(kpis.getByText("Ventas")).toBeInTheDocument();
    expect(kpis.getByText("$12,000.00")).toBeInTheDocument();
    expect(kpis.getByText("↑ 20.00%")).toBeInTheDocument();
    expect(kpis.getByText("Utilidad")).toBeInTheDocument();
    expect(kpis.getByText("$9,500.00")).toBeInTheDocument();
    expect(kpis.getByText("↑ 18.75%")).toBeInTheDocument();
    expect(kpis.getByText("Margen")).toBeInTheDocument();
    expect(kpis.getByText("79.17%")).toBeInTheDocument();
    expect(kpis.getByText("-0.83 pts")).toBeInTheDocument();
    expect(kpis.getByText("Ticket promedio")).toBeInTheDocument();
    expect(kpis.getByText("$600.00")).toBeInTheDocument();
    expect(kpis.getByText("Clientes activos")).toBeInTheDocument();
    expect(kpis.getByText("40")).toBeInTheDocument();
    expect(kpis.getByText("Top 10 clientes")).toBeInTheDocument();
    expect(kpis.getByText("64.50%")).toBeInTheDocument();
    expect(
      kpis.getByLabelText("¿Cómo se calcula la utilidad?"),
    ).toBeInTheDocument();
  });

  it("muestra las tarjetas de atención y dispara el drill-down", () => {
    const handlers = renderTab();

    fireEvent.click(screen.getByRole("button", { name: /Clientes sin ruta/ }));
    expect(handlers.onShowClientsWithoutRoute).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Clientes dormidos/ }));
    expect(handlers.onShowDormantClients).toHaveBeenCalledWith(30);

    fireEvent.click(
      screen.getByRole("button", { name: /Rutas sin actividad/ }),
    );
    expect(handlers.onShowRoutesWithoutActivity).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: /Rutas sin localidades/ }),
    );
    expect(handlers.onShowRoutesWithoutLocalities).toHaveBeenCalledTimes(1);
  });

  it("usa el preset de dormidos al hacer drill-down", () => {
    const handlers = renderTab();

    fireEvent.change(screen.getByLabelText("Clientes dormidos"), {
      target: { value: "60" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Clientes dormidos/ }));

    expect(handlers.onShowDormantClients).toHaveBeenCalledWith(60);
  });

  it("muestra rankings de clientes y rutas", () => {
    renderTab();

    expect(
      within(screen.getByTestId("top-clients")).getByText("Cliente Uno"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("top-routes")).getByText("Ruta Centro"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("route-calendar")).getByText("Ruta Centro"),
    ).toBeInTheDocument();
  });

  it("cambia el periodo con los presets", () => {
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "7 días" }));

    const expectedFrom = toLocalDateString(
      new Date(new Date().getTime() - 7 * 86400000),
    );
    expect(mocks.useClientRoutesSummary).toHaveBeenLastCalledWith(
      expectedFrom,
      toLocalDateString(new Date()),
      30,
    );
  });

  it("muestra el periodo en formato corto", () => {
    renderTab();

    expect(screen.getByTestId("summary-period")).toHaveTextContent(
      formatHumanDate("2030-01-01", "short"),
    );
    expect(screen.getByTestId("summary-period")).toHaveTextContent(
      formatHumanDate("2029-12-01", "short"),
    );
  });

  it("muestra clientes por tipo con activos e inactivos", () => {
    renderTab();

    const types = within(screen.getByTestId("client-types"));
    expect(types.getAllByText("Sucursales").length).toBeGreaterThan(0);
    expect(types.getByText("2 activos · 0 inactivos")).toBeInTheDocument();
    expect(types.getByText("5 activos · 1 inactivo")).toBeInTheDocument();
    expect(types.getByText("33 activos · 4 inactivos")).toBeInTheDocument();
    expect(
      types.getByLabelText("¿Qué tipos de cliente hay?"),
    ).toBeInTheDocument();
  });

  it("muestra Todo al día cuando no hay pendientes por atender", () => {
    mocks.useClientRoutesSummary.mockReturnValue({
      data: {
        ...summary,
        clients: {
          ...summary.clients,
          withoutLocality: 0,
          withoutRoute: 0,
          neverPurchased: 0,
          dormant: 0,
        },
        routes: {
          ...summary.routes,
          withoutLocalities: 0,
          withoutActivity: 0,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderTab();

    expect(screen.getByTestId("attention-all-clear")).toHaveTextContent(
      "Todo al día",
    );
    expect(
      screen.queryByRole("button", { name: /Clientes sin ruta/ }),
    ).not.toBeInTheDocument();
  });

  it("atenúa las tarjetas de atención en cero", () => {
    mocks.useClientRoutesSummary.mockReturnValue({
      data: {
        ...summary,
        routes: {
          ...summary.routes,
          withoutLocalities: 0,
          withoutActivity: 0,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderTab();

    expect(
      screen.getByRole("button", { name: /Clientes sin ruta/ }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /Rutas sin localidades/ }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Rutas sin actividad/ }),
    ).toBeDisabled();
  });
});
