import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { RouteDetailDrawer } from "../components/RouteDetailDrawer";
import { formatHumanDate } from "@/utils/date.utils";

const mocks = vi.hoisted(() => ({
  useRouteDetail: vi.fn(),
  useRoutePerformance: vi.fn(),
  openRouteSheet: vi.fn(),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRouteDetail: mocks.useRouteDetail,
  useRoutePerformance: mocks.useRoutePerformance,
}));

vi.mock("../utils/routeSheet", () => ({
  openRouteSheet: mocks.openRouteSheet,
}));

const detail = {
  route: {
    id: 1,
    name: "Ruta Centro",
    active: true,
    localityIds: [1],
    deliveryDays: [1, 3],
  },
  localities: [{ id: 1, name: "Centro" }],
  clients: [
    {
      id: 5,
      name: "Cliente Uno",
      businessName: "Abarrotes Uno",
      localityId: 1,
      localityName: "Centro",
      phone: "811-123-4567",
      address: "Calle 1",
      isInternalBranch: false,
      isInternalClient: false,
      lastPurchaseDate: "2030-01-20",
    },
  ],
};

const performance = [
  {
    routeId: 1,
    routeName: "Ruta Centro",
    totalQuantity: 100,
    totalSales: 5000,
    cogs: 800,
    fuelExpense: 200,
    profit: 4000,
    marginPct: 80,
    previousTotalSales: 4000,
    previousProfit: 3000,
    salesPct: 25,
    profitPct: 33.33,
    saleCount: 10,
  },
];

const renderDrawer = (overrides = {}) => {
  const handlers = {
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onAddClient: vi.fn(),
    ...overrides,
  };
  render(
    <RouteDetailDrawer
      routeId={1}
      unitType="EGG"
      onClose={handlers.onClose}
      onEdit={handlers.onEdit}
      onAddClient={handlers.onAddClient}
    />,
  );
  return handlers;
};

describe("RouteDetailDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useRouteDetail.mockReturnValue({
      data: detail,
      isLoading: false,
      isError: false,
      error: null,
    });
    mocks.useRoutePerformance.mockReturnValue({
      data: performance,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("muestra localidades, días, rendimiento y clientes con contacto", () => {
    renderDrawer();

    expect(screen.getByText("Ruta Centro")).toBeInTheDocument();
    expect(screen.getAllByText("Centro").length).toBeGreaterThan(0);
    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Mie")).toBeInTheDocument();

    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    expect(screen.getByText("80.00%")).toBeInTheDocument();
    expect(screen.getByText("↑ 25.00%")).toBeInTheDocument();

    const table = screen.getByTestId("route-detail-clients");
    expect(within(table).getByText("Abarrotes Uno")).toBeInTheDocument();
    expect(
      within(table).getByText(formatHumanDate("2030-01-20", "short")),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
      "href",
      "https://wa.me/8111234567",
    );
  });

  it("dispara editar, agregar cliente y hoja de ruta", () => {
    const handlers = renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(handlers.onEdit).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Agregar cliente" }));
    expect(handlers.onAddClient).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Hoja de ruta" }));
    expect(mocks.openRouteSheet).toHaveBeenCalledTimes(1);
  });
});
