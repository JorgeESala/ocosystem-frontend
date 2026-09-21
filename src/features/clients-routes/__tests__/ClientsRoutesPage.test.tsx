import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ClientsRoutesPage } from "../pages/ClientsRoutesPage";

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
  useClients: vi.fn(),
  useRoutes: vi.fn(),
  useRoutePerformance: vi.fn(),
}));

vi.mock("../api/summary.queries", () => ({
  useClientRoutesSummary: mocks.useClientRoutesSummary,
  useRouteCalendar: mocks.useRouteCalendar,
}));

vi.mock("@/core/client/api/client.queries", () => ({
  useClients: mocks.useClients,
  useClient: vi.fn(() => ({ data: undefined, isLoading: false })),
  useCreateClient: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useCreateInternalClient: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateClient: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteClient: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useReactivateClient: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useClientPurchases: vi.fn(() => ({
    data: {
      clientId: 1,
      totalSales: 0,
      totalQuantity: 0,
      saleCount: 0,
      firstPurchase: null,
      lastPurchase: null,
      sales: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: mocks.useRoutes,
  useRoute: vi.fn(() => ({ data: undefined, isLoading: false })),
  useCreateRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useReactivateRoute: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useRoutePerformance: mocks.useRoutePerformance,
}));

vi.mock("@/core/locality/api/locality.queries", () => ({
  useLocalities: vi.fn(() => ({
    data: [{ id: 1, name: "Centro", active: true }],
    isLoading: false,
  })),
}));

const clients = [
  {
    id: 1,
    name: "Abarrotes Don Pepe",
    businessName: null,
    localityId: 1,
    localityName: "Centro",
    isInternalBranch: false,
    isInternalClient: false,
    active: true,
    lastPurchaseDate: "2030-01-20",
  },
  {
    id: 2,
    name: "Cliente Sin Ruta",
    businessName: null,
    localityId: null,
    localityName: null,
    isInternalBranch: false,
    isInternalClient: false,
    active: true,
    lastPurchaseDate: null,
  },
];

const routes = [
  {
    id: 1,
    name: "Ruta Centro",
    active: true,
    localityIds: [1],
    deliveryDays: [1],
  },
  {
    id: 2,
    name: "Ruta Nueva",
    active: true,
    localityIds: [],
    deliveryDays: [],
  },
];

const summary = {
  period: {
    from: "2030-01-01",
    to: "2030-01-31",
    previousFrom: "2029-12-01",
    previousTo: "2029-12-31",
    dormantDays: 30,
  },
  sales: {
    totalSales: 1000,
    totalQuantity: 10,
    saleCount: 2,
    cogs: 100,
    fuelExpense: 50,
    profit: 850,
    marginPct: 85,
    averageTicket: 500,
    top10SharePct: 90,
    previous: { totalSales: 500, profit: 400, marginPct: 80 },
    variation: { salesPct: 100, profitPct: 112.5, marginPoints: 5 },
  },
  clients: {
    active: 2,
    inactive: 0,
    withoutLocality: 1,
    withoutRoute: 1,
    neverPurchased: 1,
    dormant: 0,
    byType: {
      branchesActive: 0,
      branchesInactive: 0,
      internalActive: 0,
      internalInactive: 0,
      externalActive: 2,
      externalInactive: 0,
    },
  },
  routes: {
    active: 2,
    inactive: 0,
    withoutLocalities: 1,
    withoutActivity: 1,
  },
  topClients: [],
  topRoutes: [],
  routeIdsWithoutActivity: [2],
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/business/huevo/clients-routes"]}>
      <Routes>
        <Route
          path="/business/:slug/clients-routes"
          element={<ClientsRoutesPage unitType="EGG" />}
        />
      </Routes>
    </MemoryRouter>,
  );

describe("ClientsRoutesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useClientRoutesSummary.mockReturnValue({
      data: summary,
      isLoading: false,
      isError: false,
      error: null,
    });
    mocks.useRouteCalendar.mockReturnValue({
      data: [
        {
          routeId: 1,
          name: "Ruta Centro",
          deliveryDays: [1],
          activeClients: 1,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });
    mocks.useClients.mockReturnValue({
      data: clients,
      isLoading: false,
      isError: false,
      error: null,
    });
    mocks.useRoutes.mockReturnValue({
      data: routes,
      isLoading: false,
      isError: false,
      error: null,
    });
    mocks.useRoutePerformance.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("abre en el tab Resumen y enlaza a la ayuda", () => {
    renderPage();

    expect(screen.getByTestId("summary-kpis")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ayuda/ })).toHaveAttribute(
      "href",
      "/business/huevo/clients-routes/help",
    );
  });

  it("hace drill-down de clientes sin ruta al tab Clientes con filtro", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Clientes sin ruta/ }));

    expect(screen.getByText("Cliente Sin Ruta")).toBeInTheDocument();
    expect(screen.queryByText("Abarrotes Don Pepe")).not.toBeInTheDocument();
  });

  it("hace drill-down de rutas sin actividad al tab Rutas con rendimiento", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /Rutas sin actividad/ }),
    );

    expect(
      screen.getByText("Rendimiento y rentabilidad por ruta"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Ruta Nueva").length).toBeGreaterThan(0);
  });
});
