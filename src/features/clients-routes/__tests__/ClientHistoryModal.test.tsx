import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClientHistoryModal } from "../components/ClientHistoryModal";
import type { Client } from "@/core/api/types";
import { formatHumanDate } from "@/utils/date.utils";

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
  useClientPurchases: vi.fn(),
}));

vi.mock("@/core/client/api/client.queries", () => ({
  useClients: vi.fn(() => ({ data: [], isLoading: false })),
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
  useClientPurchases: mocks.useClientPurchases,
}));

const client: Client = {
  id: 1,
  name: "Abarrotes Don Pepe",
  isInternalBranch: false,
  active: true,
};

describe("ClientHistoryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el resumen y las ventas recientes", () => {
    mocks.useClientPurchases.mockReturnValue({
      data: {
        clientId: 1,
        totalSales: 1500,
        totalQuantity: 30,
        saleCount: 2,
        firstPurchase: "2032-01-05",
        lastPurchase: "2032-01-20",
        previousTotalSales: 1000,
        salesVariationPct: 50,
        sales: [
          {
            id: 11,
            saleDate: "2032-01-20",
            routeId: 1,
            routeName: "Centro",
            quantity: 10,
            saleTotal: 800,
          },
          {
            id: 10,
            saleDate: "2032-01-05",
            routeId: null,
            routeName: null,
            quantity: 20,
            saleTotal: 700,
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <ClientHistoryModal
        show
        onClose={vi.fn()}
        unitType="EGG"
        client={client}
      />,
    );

    expect(screen.getByText("Historial de compras")).toBeInTheDocument();
    expect(screen.getByText("Abarrotes Don Pepe")).toBeInTheDocument();
    expect(
      screen.getByLabelText("¿Qué muestra el historial?"),
    ).toBeInTheDocument();
    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
    expect(screen.getByText("Centro")).toBeInTheDocument();
    expect(screen.getByText("Sin ruta")).toBeInTheDocument();
    expect(
      screen.getAllByText(formatHumanDate("2032-01-20", "short")).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(formatHumanDate("2032-01-05", "short")).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("↑ 50.00%")).toBeInTheDocument();
  });

  it("muestra el estado vacío sin compras", () => {
    mocks.useClientPurchases.mockReturnValue({
      data: {
        clientId: 1,
        totalSales: 0,
        totalQuantity: 0,
        saleCount: 0,
        firstPurchase: null,
        lastPurchase: null,
        previousTotalSales: 0,
        salesVariationPct: null,
        sales: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <ClientHistoryModal
        show
        onClose={vi.fn()}
        unitType="EGG"
        client={client}
      />,
    );

    expect(screen.getByText("Sin compras en el rango.")).toBeInTheDocument();
  });
});
