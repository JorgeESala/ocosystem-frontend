import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

const renderModal = () =>
  render(<RouteOrderSalesModal batch={batch} onClose={vi.fn()} />);

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

    fireEvent.change(
      screen.getByPlaceholderText(/Cliente, negocio o ruta/i),
      { target: { value: "Cliente A" } },
    );
    expect(screen.queryByText("Cliente B")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Regenerar ventas/i }));

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    const payload = mocks.mutate.mock.calls[0][0].payload;
    expect(payload.lines).toHaveLength(2);
    expect(payload.lines.map((line: { lineId: number }) => line.lineId)).toEqual(
      [1, 2],
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
});
