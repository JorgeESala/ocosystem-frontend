import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AvailabilityAuditDrawer } from "../components/AvailabilityAuditDrawer";
import type { BatchResponseDTO } from "../types.batch";
import type { PendingOrderBreakdownDTO } from "@/features/route-orders/types/routeOrder.types";

const mocks = vi.hoisted(() => ({
  usePendingOrderBreakdown: vi.fn(),
}));

vi.mock("@/features/route-orders/api/routeOrders.queries", () => ({
  usePendingOrderBreakdown: mocks.usePendingOrderBreakdown,
}));

const batch = (
  overrides: Partial<BatchResponseDTO> = {},
): BatchResponseDTO => ({
  id: 1,
  supplierId: 1,
  supplierName: "Proveedor",
  cedisId: 1,
  cedisName: "CEDIS",
  entryDate: "2030-01-07",
  totalAmount: "1000",
  type: "LIVE_CHICKEN",
  metadata: {},
  initialQuantity: "500",
  soldQuantity: "62",
  adjustedQuantity: "0",
  remainingQuantity: "438",
  remainingBoxes: 0,
  remainingCartons: 0,
  remainingPieces: 0,
  availableCost: "876.00",
  ...overrides,
});

const breakdown: PendingOrderBreakdownDTO = {
  unitType: "LIVE_CHICKEN",
  startDate: "2030-01-01",
  endDate: "2030-01-31",
  totalQuantity: 1545,
  lineCount: 2,
  excludedQuantity: 50,
  excludedLineCount: 1,
  days: [
    {
      date: "2030-01-20",
      quantity: 1545,
      lineCount: 2,
      routes: [
        {
          routeId: 3,
          routeName: "Ruta Centro",
          quantity: 1545,
          lineCount: 2,
          orders: [
            {
              orderId: 456,
              tripId: null,
              driverName: "Chofer Uno",
              quantity: 1545,
              lineCount: 2,
              excludedQuantity: 50,
              excludedLineCount: 1,
              lines: [
                {
                  lineId: 1,
                  clientId: 10,
                  clientName: "Cliente A",
                  businessName: "Abarrotes A",
                  localityName: "Centro",
                  quantity: 1000,
                },
                {
                  lineId: 2,
                  clientId: 11,
                  clientName: "Cliente B",
                  businessName: "Abarrotes B",
                  localityName: "Centro",
                  quantity: 545,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const renderDrawer = (unitType: "LIVE_CHICKEN" | "EGG" = "LIVE_CHICKEN") =>
  render(
    <AvailabilityAuditDrawer
      open
      onClose={vi.fn()}
      unitType={unitType}
      startDate="2030-01-01"
      endDate="2030-01-31"
      includedBatches={[batch()]}
      allBatches={[
        batch(),
        batch({
          id: 2,
          entryDate: "2029-12-01",
          remainingQuantity: "100",
        }),
        batch({
          id: 3,
          entryDate: "2030-01-08",
          remainingQuantity: "0",
        }),
      ]}
      totalRemainingUnits={438}
    />,
  );

describe("AvailabilityAuditDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePendingOrderBreakdown.mockReturnValue({
      data: breakdown,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("muestra la resta de existencia menos pedidos pendientes", () => {
    renderDrawer();

    expect(screen.getByText("Existencia en remesas")).toBeInTheDocument();
    expect(screen.getAllByText("438 aves").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1,545 aves").length).toBeGreaterThan(0);
    expect(screen.getByText("-1,107 aves")).toBeInTheDocument();
    expect(screen.getByText("Sobrepedido")).toBeInTheDocument();
  });

  it("abre por día y desglosa ruta, pedido y clientes", () => {
    renderDrawer();

    expect(screen.getByRole("button", { name: "Por día" })).toBeInTheDocument();
    expect(screen.getAllByText("Ruta Centro").length).toBeGreaterThan(0);
    expect(screen.getByText("Pedido #456")).toBeInTheDocument();
    expect(screen.getByText("Sin viaje")).toBeInTheDocument();
    expect(screen.getByText("Cliente A")).toBeInTheDocument();
    expect(screen.getByText("Cliente B")).toBeInTheDocument();
    expect(
      screen.getByText(/línea\(s\) ya vendida\(s\) excluida\(s\)/),
    ).toBeInTheDocument();
  });

  it("muestra las remesas incluidas y las excluidas con su motivo", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole("button", { name: "Remesas" }));

    expect(screen.getByText("Remesas no incluidas")).toBeInTheDocument();
    expect(screen.getByText("Fuera del rango de fechas")).toBeInTheDocument();
    expect(screen.getByText("Sin existencia")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(
      within(screen.getByRole("table")).getByText("$876.00"),
    ).toBeInTheDocument();
  });

  it("filtra el detalle por ruta", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.selectOptions(
      screen.getByLabelText("Ruta"),
      String(breakdown.days[0].routes[0].routeId),
    );

    expect(screen.getAllByText("Ruta Centro").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1,545 aves").length).toBeGreaterThan(0);
  });
});
