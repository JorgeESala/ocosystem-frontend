import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TripInlineRow from "../components/TripInlineRow";
import type { TripGroup } from "../utils/tripGrouping";
import type { TripSummaryDTO } from "../types/trip.types";

const mocks = vi.hoisted(() => ({
  tripSales: [] as unknown[],
}));

vi.mock("../api/trips.queries", () => ({
  useTripSales: () => ({ data: mocks.tripSales, isLoading: false }),
  useUpdateTrip: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateTrip: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/features/batch/api/batch.queries", () => ({
  useBulkUpdateBatchSaleRoute: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: () => ({ data: [], isLoading: false }),
  useCreateRoute: () => ({ mutate: vi.fn(), isPending: false }),
}));

const tripSummary: TripSummaryDTO = {
  id: 76,
  driverId: 25,
  driverName: "Jorge",
  vehicleId: null,
  vehicleName: null,
  routeId: 3,
  routeName: "Señor",
  departureDate: "2026-11-19",
  totalKgLoaded: 482.5,
  totalKgReturned: null,
  batchSources: [],
  salesCount: 2,
  totalSaleAmount: 300,
  totalQuantity: 20,
  totalWeight: 30,
  totalKgSent: 31,
};

const currentMovement = {
  id: 1,
  type: "SALE" as const,
  date: "2026-11-19",
  employeeId: 25,
  employeeName: "Jorge",
  routeId: 3,
  routeName: "Señor",
  tripId: 76,
  batchId: 130,
  clientId: 196,
  clientName: "RONELI",
  quantity: 10,
  weight: 15,
  kgSent: 15.5,
  saleTotal: 100,
  internalClient: false,
};

const otherBatchSale = {
  id: 2,
  tripId: 76,
  batchId: 129,
  batchLabel: "Remesa del 2026-11-18",
  clientId: 6,
  clientName: "Esperanza",
  internalClient: false,
  employeeName: "Jorge",
  routeName: "Señor",
  saleDate: "2026-11-19",
  weight: 15,
  kgSent: 15.5,
  quantity: 10,
  saleTotal: 200,
};

const group: TripGroup = {
  key: "trip-76",
  tripId: 76,
  driverId: 25,
  driverName: "Jorge",
  routeId: 3,
  routeName: "Señor",
  date: "2026-11-19",
  trip: tripSummary,
  movements: [currentMovement],
  totals: {
    kgSold: 15,
    kgSent: 15.5,
    totalPieces: 10,
    saleTotal: 100,
    salesCount: 1,
  },
};

describe("TripInlineRow - ventas del viaje", () => {
  it("muestra un despacho sin viaje y separa clientes internos", async () => {
    mocks.tripSales = [];

    const internalSale = {
      ...currentMovement,
      id: 3,
      tripId: null,
      clientId: 7,
      clientName: "Sucursal",
      internalClient: true,
    };
    const untrippedGroup: TripGroup = {
      key: "untripped-25|2026-11-19",
      tripId: null,
      driverId: 25,
      driverName: "Jorge",
      routeId: 3,
      routeName: "Señor",
      date: "2026-11-19",
      trip: null,
      movements: [internalSale, currentMovement],
      totals: {
        kgSold: 30,
        kgSent: 31,
        totalPieces: 20,
        saleTotal: 200,
        salesCount: 2,
      },
    };

    render(
      <TripInlineRow
        unitType="LIVE_CHICKEN"
        currentBatchId={130}
        group={untrippedGroup}
        defaultExpanded
        renderSaleColumns={(movement) => <span>{movement.clientName}</span>}
        renderHeaderColumns={() => <span>Encabezado</span>}
      />,
    );

    expect((await screen.findAllByText("Ventas")).length).toBeGreaterThan(0);
    expect(await screen.findByText("Sucursal")).toBeInTheDocument();
    expect(await screen.findByText("RONELI")).toBeInTheDocument();
    expect(
      screen.queryByText("Aún no hay ventas registradas en este despacho."),
    ).not.toBeInTheDocument();
  });

  it("muestra el mensaje cuando el viaje no tiene ventas", async () => {
    mocks.tripSales = [];

    render(
      <TripInlineRow
        unitType="LIVE_CHICKEN"
        currentBatchId={130}
        group={{ ...group, movements: [] }}
        tripId={76}
        renderSaleColumns={(movement) => <span>{movement.clientName}</span>}
        renderHeaderColumns={() => <span>Encabezado</span>}
      />,
    );

    expect(
      await screen.findByText("Aún no hay ventas registradas en este viaje."),
    ).toBeInTheDocument();
  });

  it("muestra los totales de todo el viaje y las ventas de otras remesas", async () => {
    mocks.tripSales = [currentMovement, otherBatchSale];

    render(
      <TripInlineRow
        unitType="LIVE_CHICKEN"
        currentBatchId={130}
        group={group}
        tripId={76}
        renderSaleColumns={(movement, isOtherBatch) => (
          <span>
            {movement.clientName}
            {isOtherBatch ? " (otra remesa)" : ""}
          </span>
        )}
        renderHeaderColumns={() => <span>Encabezado</span>}
      />,
    );

    expect(await screen.findByText("Ventas viaje")).toBeInTheDocument();
    expect(screen.getByText("$300.00")).toBeInTheDocument();
    expect(await screen.findByText("RONELI")).toBeInTheDocument();
    expect(
      await screen.findByText("Esperanza (otra remesa)"),
    ).toBeInTheDocument();
  });
});
