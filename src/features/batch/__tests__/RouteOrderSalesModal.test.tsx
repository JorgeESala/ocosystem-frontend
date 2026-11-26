import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { RouteOrderSalesModal } from "../components/RouteOrderSalesModal";
import type { BatchResponseDTO } from "../types.batch";
import type { RouteOrderSaleCandidateDTO } from "@/features/route-orders/types/routeOrder.types";
import { toLocalDateString } from "@/utils/date.utils";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  candidates: [] as RouteOrderSaleCandidateDTO[],
}));

vi.mock("@/features/route-orders/api/routeOrders.queries", () => ({
  useRouteOrderSaleCandidates: () => ({
    data: mocks.candidates,
    isLoading: false,
    isError: false,
    isSuccess: true,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useGenerateRouteOrderSales: () => ({
    mutate: mocks.mutate,
    isPending: false,
  }),
  useRegenerateRouteOrderSales: () => ({
    mutate: mocks.mutate,
    isPending: false,
  }),
}));

vi.mock("@/features/employee/api/employees.queries", () => ({
  useDrivers: () => ({ data: [{ id: 1, name: "Chofer Uno" }] }),
}));

const batch: BatchResponseDTO = {
  id: 10,
  supplierId: 1,
  supplierName: "Proveedor",
  cedisId: 1,
  cedisName: "CEDIS",
  entryDate: "2030-01-07",
  totalAmount: "0",
  type: "LIVE_CHICKEN",
  metadata: {},
  initialQuantity: "0",
  soldQuantity: "0",
  adjustedQuantity: "0",
  remainingQuantity: "0",
  remainingBoxes: 0,
  remainingCartons: 0,
  remainingPieces: 0,
};

const candidate = (
  overrides: Partial<RouteOrderSaleCandidateDTO> = {},
): RouteOrderSaleCandidateDTO => ({
  orderId: 1,
  lineId: 1,
  unitType: "LIVE_CHICKEN",
  routeId: 1,
  routeName: "Ruta Centro",
  driverId: 1,
  driverName: "Chofer Uno",
  tripId: null,
  clientId: 10,
  clientName: "Cliente A",
  businessName: "Abarrotes A",
  localityName: "Centro",
  isInternalBranch: false,
  isInternalClient: false,
  headCount: 10,
  quantity: 0,
  unitPrice: 35,
  alreadySold: false,
  ...overrides,
});

const renderModal = (batchOverrides: Partial<BatchResponseDTO> = {}) =>
  render(
    <RouteOrderSalesModal
      batch={{ ...batch, ...batchOverrides }}
      onClose={vi.fn()}
    />,
  );

describe("RouteOrderSalesModal", () => {
  it("selecciona por defecto los pendientes y deshabilita los ya vendidos", () => {
    mocks.candidates = [
      candidate(),
      candidate({
        lineId: 2,
        clientId: 11,
        clientName: "Cliente B",
        alreadySold: true,
      }),
    ];

    renderModal();

    expect(screen.getByTestId("select-1")).toBeChecked();
    expect(screen.getByTestId("select-2")).toBeDisabled();
  });

  it("prellena los kilos vendidos con el peso del pedido", () => {
    mocks.candidates = [candidate({ weight: 219.616 })];

    renderModal();

    expect(screen.getByTestId("kg-1")).toHaveValue(219.616);
  });

  it("permite agregar otra venta a un cliente ya vendido", () => {
    mocks.candidates = [
      candidate({
        alreadySold: true,
      }),
    ];

    renderModal();

    expect(screen.getByTestId("select-1")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Agregar otra/i }));

    expect(screen.getByTestId("select-1")).not.toBeDisabled();
    expect(screen.getByTestId("select-1")).toBeChecked();
    expect(screen.getByText("Forzada")).toBeInTheDocument();
  });

  it("avisa y permite regenerar un pedido con cambios pendientes", () => {
    mocks.mutate.mockReset();
    mocks.candidates = [
      candidate({
        alreadySold: true,
        salesRegenerationRequired: true,
      }),
    ];

    renderModal();

    expect(
      screen.getByText(/Hay pedidos con cambios pendientes/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("kg-1"), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Regenerar ventas/i }));

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    expect(mocks.mutate.mock.calls[0][0]).toMatchObject({
      orderId: 1,
      payload: {
        batchId: 10,
        lines: [
          {
            orderId: 1,
            lineId: 1,
            driverId: 1,
            headCount: 10,
            weight: 100,
            kgSent: 100,
            unitPrice: 35,
          },
        ],
      },
    });
  });

  it("regenera todas las líneas aunque el filtro oculte alguna", () => {
    mocks.mutate.mockReset();
    mocks.candidates = [
      candidate({
        unitType: "EGG",
        clientName: "Cliente A",
        quantity: 10,
        alreadySold: true,
        salesRegenerationRequired: true,
      }),
      candidate({
        lineId: 2,
        clientId: 11,
        clientName: "Cliente B",
        unitType: "EGG",
        quantity: 5,
        alreadySold: false,
      }),
    ];

    render(
      <RouteOrderSalesModal
        batch={{ ...batch, type: "EGG" }}
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/Cliente, negocio o ruta/i), {
      target: { value: "Cliente A" },
    });
    expect(screen.queryByText("Cliente B")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Regenerar ventas/i }));

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    const payload = mocks.mutate.mock.calls[0][0].payload;
    expect(payload.lines).toHaveLength(2);
    expect(
      payload.lines.map((line: { lineId: number }) => line.lineId),
    ).toEqual([1, 2]);
  });

  it("regenera líneas de pollo ocultas usando sus kilos guardados", () => {
    mocks.mutate.mockReset();
    mocks.candidates = [
      candidate({
        clientName: "Cliente A",
        weight: 100,
        kgSent: 102,
        alreadySold: true,
        salesRegenerationRequired: true,
      }),
      candidate({
        lineId: 2,
        clientId: 11,
        clientName: "Cliente B",
        weight: 50,
        kgSent: 51,
        alreadySold: false,
      }),
    ];

    renderModal();

    fireEvent.change(screen.getByPlaceholderText(/Cliente, negocio o ruta/i), {
      target: { value: "Cliente A" },
    });
    expect(screen.queryByText("Cliente B")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Regenerar ventas/i }));

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    const payload = mocks.mutate.mock.calls[0][0].payload;
    expect(payload.lines).toHaveLength(2);
    expect(payload.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ lineId: 1, weight: 100, kgSent: 102 }),
        expect.objectContaining({ lineId: 2, weight: 50, kgSent: 51 }),
      ]),
    );
  });

  it("genera la venta con cabezas, kilos y kilos enviados", () => {
    mocks.mutate.mockReset();
    mocks.candidates = [candidate()];

    renderModal();

    fireEvent.change(screen.getByTestId("kg-1"), {
      target: { value: "100" },
    });
    expect((screen.getByTestId("kg-sent-1") as HTMLInputElement).value).toBe(
      "100",
    );

    fireEvent.click(screen.getByRole("button", { name: /Generar ventas/i }));

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    expect(mocks.mutate.mock.calls[0][0]).toMatchObject({
      batchId: 10,
      date: toLocalDateString(new Date()),
      lines: [
        {
          orderId: 1,
          lineId: 1,
          driverId: 1,
          force: false,
          headCount: 10,
          weight: 100,
          kgSent: 100,
          unitPrice: 35,
        },
      ],
    });
  });

  it("prellena el total con los kilos por el precio", () => {
    mocks.candidates = [candidate({ weight: 100 })];

    renderModal();

    expect(screen.getByTestId("total-1")).toHaveValue(3500);
  });

  it("recalcula el precio por kilo al cambiar el total", () => {
    mocks.candidates = [candidate({ weight: 100 })];

    renderModal();

    fireEvent.change(screen.getByTestId("total-1"), {
      target: { value: "4000" },
    });

    expect(screen.getByTestId("total-1")).toHaveValue(4000);
    expect(screen.getByTestId("price-1")).toHaveValue(40);
  });

  it("recalcula el total al cambiar el precio por kilo", () => {
    mocks.candidates = [candidate({ weight: 100 })];

    renderModal();

    fireEvent.change(screen.getByTestId("price-1"), {
      target: { value: "45" },
    });

    expect(screen.getByTestId("total-1")).toHaveValue(4500);
  });

  it("conserva el total capturado al cambiar los kilos", () => {
    mocks.candidates = [candidate({ weight: 100 })];

    renderModal();

    fireEvent.change(screen.getByTestId("total-1"), {
      target: { value: "4000" },
    });
    fireEvent.change(screen.getByTestId("kg-1"), {
      target: { value: "200" },
    });

    expect(screen.getByTestId("total-1")).toHaveValue(4000);
    expect(screen.getByTestId("price-1")).toHaveValue(20);
  });

  it("recalcula el total al cambiar los kilos si el precio fue lo último editado", () => {
    mocks.candidates = [candidate({ weight: 100 })];

    renderModal();

    fireEvent.change(screen.getByTestId("price-1"), {
      target: { value: "40" },
    });
    fireEvent.change(screen.getByTestId("kg-1"), {
      target: { value: "200" },
    });

    expect(screen.getByTestId("total-1")).toHaveValue(8000);
  });

  it("envía el precio derivado del total capturado", () => {
    mocks.mutate.mockReset();
    mocks.candidates = [candidate({ weight: 219.616, kgSent: 219.616 })];

    renderModal();

    fireEvent.change(screen.getByTestId("total-1"), {
      target: { value: "9000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Generar ventas/i }));

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    const line = mocks.mutate.mock.calls[0][0].lines[0];
    expect(line.weight * line.unitPrice).toBeCloseTo(9000, 2);
  });

  it("muestra el peso promedio por ave de la remesa", () => {
    mocks.candidates = [candidate()];

    renderModal({
      initialQuantity: "100",
      weightReal: "215",
      remainingQuantity: "100",
    });

    expect(screen.getByTestId("avg-chicken-weight")).toHaveTextContent(
      "2.15 kg/ave",
    );
  });

  it("muestra las aves disponibles después de los pedidos pendientes", () => {
    mocks.candidates = [candidate({ headCount: 5 })];

    renderModal({ remainingQuantity: "20" });

    expect(screen.getByTestId("available-to-sell")).toHaveTextContent(
      "15 aves",
    );
  });

  it("no descuenta pedidos que ya se vendieron", () => {
    mocks.candidates = [candidate({ headCount: 5, alreadySold: true })];

    renderModal({ remainingQuantity: "15" });

    expect(screen.getByTestId("available-to-sell")).toHaveTextContent(
      "15 aves",
    );
  });

  it("descuenta una venta adicional forzada", () => {
    mocks.candidates = [candidate({ headCount: 5, alreadySold: true })];

    renderModal({ remainingQuantity: "15" });
    fireEvent.click(screen.getByRole("button", { name: /Agregar otra/i }));

    expect(screen.getByTestId("available-to-sell")).toHaveTextContent(
      "10 aves",
    );
  });

  it("actualiza la disponibilidad al cambiar las cabezas", () => {
    mocks.candidates = [candidate({ headCount: 5 })];

    renderModal({ remainingQuantity: "20" });
    fireEvent.change(screen.getByTestId("heads-1"), {
      target: { value: "8" },
    });

    expect(screen.getByTestId("available-to-sell")).toHaveTextContent(
      "12 aves",
    );
  });

  it("muestra la disponibilidad de huevo en cajas y casilleros", () => {
    mocks.candidates = [
      candidate({ unitType: "EGG", quantity: 12, headCount: 0 }),
    ];

    render(
      <RouteOrderSalesModal
        batch={{ ...batch, type: "EGG", remainingQuantity: "7200" }}
        onClose={vi.fn()}
      />,
    );

    const available = screen.getByTestId("available-to-sell");
    expect(within(available).getByTitle("Cajas")).toHaveTextContent("19");
  });

  it("no muestra el peso promedio en huevo", () => {
    mocks.candidates = [
      candidate({ unitType: "EGG", quantity: 12, headCount: 0 }),
    ];

    render(
      <RouteOrderSalesModal
        batch={{ ...batch, type: "EGG" }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("avg-chicken-weight")).not.toBeInTheDocument();
  });

  it("muestra sobrepedido cuando los pedidos superan la remesa", () => {
    mocks.candidates = [candidate({ headCount: 25 })];

    renderModal({ remainingQuantity: "20" });

    expect(screen.getByTestId("available-to-sell")).toHaveTextContent(
      "-5 aves",
    );
    expect(screen.getByText("Sobrepedido")).toBeInTheDocument();
  });
});
