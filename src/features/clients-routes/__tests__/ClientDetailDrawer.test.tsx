import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClientDetailDrawer } from "../components/ClientDetailDrawer";
import type { Client, Route } from "@/core/api/types";
import { formatHumanDate } from "@/utils/date.utils";

const mocks = vi.hoisted(() => ({
  useClientPurchases: vi.fn(),
}));

vi.mock("@/core/client/api/client.queries", () => ({
  useClientPurchases: mocks.useClientPurchases,
}));

const client: Client = {
  id: 5,
  name: "Cliente Uno",
  businessName: "Abarrotes Uno",
  localityId: 1,
  localityName: "Centro",
  phone: "811-123-4567",
  address: "Calle 1",
  isInternalBranch: false,
  isInternalClient: false,
  active: true,
  lastPurchaseDate: "2030-01-20",
};

const routes: Route[] = [
  {
    id: 1,
    name: "Ruta Centro",
    active: true,
    localityIds: [1],
    deliveryDays: [1],
  },
];

const renderDrawer = (overrides = {}) => {
  const handlers = {
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onHistory: vi.fn(),
    ...overrides,
  };
  render(
    <ClientDetailDrawer
      client={client}
      routes={routes}
      unitType="EGG"
      onClose={handlers.onClose}
      onEdit={handlers.onEdit}
      onHistory={handlers.onHistory}
    />,
  );
  return handlers;
};

describe("ClientDetailDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useClientPurchases.mockReturnValue({
      data: {
        clientId: 5,
        totalSales: 1500,
        totalQuantity: 30,
        saleCount: 3,
        firstPurchase: "2030-01-05",
        lastPurchase: "2030-01-20",
        previousTotalSales: 1000,
        salesVariationPct: 50,
        sales: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("muestra contacto, ruta derivada, última compra y variación", () => {
    renderDrawer();

    expect(screen.getByText("Abarrotes Uno")).toBeInTheDocument();
    expect(screen.getByText("Ruta Centro")).toBeInTheDocument();
    expect(screen.getByText("Calle 1")).toBeInTheDocument();
    expect(
      screen.getByText(formatHumanDate("2030-01-20", "short")),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
      "href",
      "https://wa.me/8111234567",
    );
    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
    expect(screen.getByText("↑ 50.00%")).toBeInTheDocument();
  });

  it("dispara editar e historial", () => {
    const handlers = renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(handlers.onEdit).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByRole("button", { name: "Historial" }));
    expect(handlers.onHistory).toHaveBeenCalledTimes(1);
  });
});
