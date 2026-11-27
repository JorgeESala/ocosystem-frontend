import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalAvailabilitySummary } from "../components/GlobalAvailabilitySummary";
import type { BatchResponseDTO } from "../types.batch";

const mocks = vi.hoisted(() => ({
  usePendingOrderQuantity: vi.fn(),
}));

vi.mock("@/features/route-orders/api/routeOrders.queries", () => ({
  usePendingOrderQuantity: mocks.usePendingOrderQuantity,
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
  initialQuantity: "10",
  soldQuantity: "0",
  adjustedQuantity: "0",
  remainingQuantity: "10",
  remainingBoxes: 0,
  remainingCartons: 0,
  remainingPieces: 0,
  ...overrides,
});

const renderSummary = (
  unitType: "LIVE_CHICKEN" | "EGG" | "PORK",
  batches: BatchResponseDTO[],
) =>
  render(
    <GlobalAvailabilitySummary
      batches={batches}
      unitType={unitType}
      startDate="2030-01-01"
      endDate="2030-01-31"
      onBatchClick={vi.fn()}
    />,
  );

describe("GlobalAvailabilitySummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePendingOrderQuantity.mockReturnValue({
      data: { unitType: "LIVE_CHICKEN", quantity: 5, lineCount: 1 },
      isLoading: false,
    });
  });

  it("descuenta los pedidos pendientes del total disponible", () => {
    renderSummary("LIVE_CHICKEN", [
      batch({ remainingQuantity: "10" }),
      batch({ id: 2, remainingQuantity: "10" }),
    ]);

    expect(screen.getByTestId("available-after-orders")).toHaveTextContent(
      "15 aves",
    );
    expect(mocks.usePendingOrderQuantity).toHaveBeenCalledWith(
      "2030-01-01",
      "2030-01-31",
      true,
    );
  });

  it("muestra la disponibilidad de huevo en piezas y casilleros", () => {
    mocks.usePendingOrderQuantity.mockReturnValue({
      data: { unitType: "EGG", quantity: 2, lineCount: 1 },
      isLoading: false,
    });

    renderSummary("EGG", [
      batch({
        type: "EGG",
        remainingQuantity: "360",
        remainingBoxes: 1,
        remainingCartons: 0,
        remainingPieces: 0,
      }),
    ]);

    const available = screen.getByTestId("available-after-orders");
    expect(within(available).getByTitle("Casilleros")).toHaveTextContent("10");
  });

  it("muestra el cálculo pendiente mientras carga", () => {
    mocks.usePendingOrderQuantity.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderSummary("LIVE_CHICKEN", [batch({ remainingQuantity: "10" })]);

    expect(screen.getAllByText("Calculando...")).toHaveLength(2);
  });

  it("muestra guion cuando no hay pedidos pendientes calculados", () => {
    mocks.usePendingOrderQuantity.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    renderSummary("LIVE_CHICKEN", [batch({ remainingQuantity: "20" })]);

    expect(screen.getByTestId("pending-orders")).toHaveTextContent("—");
    expect(screen.getByTestId("available-after-orders")).toHaveTextContent(
      "20 aves",
    );
  });

  it("marca sobrepedido cuando los pedidos superan la existencia", () => {
    mocks.usePendingOrderQuantity.mockReturnValue({
      data: { unitType: "LIVE_CHICKEN", quantity: 15, lineCount: 2 },
      isLoading: false,
    });

    renderSummary("LIVE_CHICKEN", [batch({ remainingQuantity: "10" })]);

    expect(screen.getByTestId("available-after-orders")).toHaveTextContent(
      "-5 aves",
    );
    expect(screen.getByText("Sobrepedido")).toBeInTheDocument();
  });

  it("muestra el faltante de huevo cuando hay sobrepedido", () => {
    mocks.usePendingOrderQuantity.mockReturnValue({
      data: { unitType: "EGG", quantity: 2, lineCount: 1 },
      isLoading: false,
    });

    renderSummary("EGG", [
      batch({
        type: "EGG",
        remainingQuantity: "30",
        remainingBoxes: 0,
        remainingCartons: 1,
        remainingPieces: 0,
      }),
    ]);

    expect(screen.getByText("Sobrepedido")).toBeInTheDocument();
    expect(screen.getByText("Faltan")).toBeInTheDocument();
  });

  it("no muestra pedidos para cerdo", () => {
    renderSummary("PORK", [batch({ type: "PORK" })]);

    expect(screen.queryByTestId("pending-orders")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("available-after-orders"),
    ).not.toBeInTheDocument();
    expect(mocks.usePendingOrderQuantity).toHaveBeenCalledWith(
      "2030-01-01",
      "2030-01-31",
      false,
    );
  });
});
