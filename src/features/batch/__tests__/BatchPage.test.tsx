import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BatchPage } from "../pages/BatchPage";

const tripMock = vi.hoisted(() => ({ useTripSummary: vi.fn() }));
const summaryMock = vi.hoisted(() => ({
  props: [] as Array<Record<string, unknown>>,
}));

const batch = {
  id: 130,
  supplierId: 1,
  supplierName: "Proveedor",
  cedisId: 1,
  cedisName: "CEDIS",
  entryDate: "2026-11-19",
  totalAmount: "1000",
  type: "LIVE_CHICKEN" as const,
  metadata: {},
  initialQuantity: "100",
  soldQuantity: "100",
  adjustedQuantity: "0",
  remainingQuantity: "0",
  remainingBoxes: 0,
  remainingCartons: 0,
  remainingPieces: 0,
};

vi.mock("../api/batch.queries", () => ({
  useBatches: () => ({
    data: [batch],
    isLoading: false,
    isError: false,
  }),
}));

const tripSummary = {
  id: 76,
  driverId: 25,
  driverName: "Jorge",
  vehicleId: null,
  vehicleName: null,
  routeId: 3,
  routeName: "Señor",
  departureDate: "2026-11-19",
  totalKgLoaded: null,
  totalKgReturned: null,
  batchSources: [
    {
      id: 1,
      batchId: 130,
      batchLabel: "Remesa del 2026-11-19",
      kgLoaded: 0,
      createdAt: "2026-11-19T00:00:00Z",
    },
  ],
  salesCount: 0,
};

vi.mock("@/features/trips/api/trips.queries", () => ({
  useTripSummary: tripMock.useTripSummary,
}));

vi.mock("../config/unitConfig", () => ({
  UNIT_CONFIG: {
    LIVE_CHICKEN: {
      label: "Pollo vivo",
      description: "Pollo vivo",
      overviewComponent: () => <div>Tarjeta de remesa</div>,
    },
  },
}));

vi.mock("../components/GlobalAvailabilitySummary", () => ({
  GlobalAvailabilitySummary: (props: Record<string, unknown>) => {
    summaryMock.props.push(props);
    return <div>Disponibilidad</div>;
  },
}));

vi.mock("../components/WeeklySalesChart", () => ({
  WeeklySalesChart: () => <div>Ventas semanales</div>,
}));

vi.mock("../components/SalesByClientChart", () => ({
  SalesByClientChart: () => <div>Ventas por cliente</div>,
}));

vi.mock("../components/BatchEntryForm", () => ({
  BatchEntryForm: () => <div>Nueva remesa</div>,
}));

describe("BatchPage - acceso a un viaje", () => {
  beforeEach(() => {
    tripMock.useTripSummary.mockReset();
    summaryMock.props.length = 0;
    tripMock.useTripSummary.mockImplementation(
      (_unitType: string, id: number | null) => ({
        data: id === 76 ? tripSummary : undefined,
      }),
    );
  });

  it("muestra las remesas sin existencia al abrir un viaje", async () => {
    render(
      <MemoryRouter
        initialEntries={["/business/pollo-vivo/salesAndBatches?tripId=76"]}
      >
        <BatchPage unitType="LIVE_CHICKEN" />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Tarjeta de remesa")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("switch", { name: "Solo con disponibilidad" }),
      ).not.toBeChecked(),
    );
    expect(tripMock.useTripSummary).toHaveBeenCalledWith("LIVE_CHICKEN", 76);
  });

  it("muestra la remesa indicada aunque no tenga existencia", async () => {
    render(
      <MemoryRouter
        initialEntries={["/business/pollo-vivo/salesAndBatches?batch=130"]}
      >
        <BatchPage unitType="LIVE_CHICKEN" />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Tarjeta de remesa")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("switch", { name: "Solo con disponibilidad" }),
      ).not.toBeChecked(),
    );
  });

  it("entrega el mismo rango de fechas a la disponibilidad global", async () => {
    render(
      <MemoryRouter initialEntries={["/business/pollo-vivo/salesAndBatches"]}>
        <BatchPage unitType="LIVE_CHICKEN" />
      </MemoryRouter>,
    );

    expect(await screen.findAllByText("Disponibilidad")).not.toHaveLength(0);
    await waitFor(() => expect(summaryMock.props.length).toBeGreaterThan(0));

    const props = summaryMock.props[summaryMock.props.length - 1];
    expect(props.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(props.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(props.batches).toEqual([]);
  });
});
