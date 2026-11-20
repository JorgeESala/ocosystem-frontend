import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EggMovementsTable } from "../components/egg/EggMovementsTable";
import { ChickenMovementsTable } from "../components/live-chicken/ChickenMovementsTable";

vi.mock("@/features/trips/api/trips.queries", () => ({
  useTripsForBatch: () => ({
    data: [
      {
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
        batchSources: [],
        salesCount: 2,
        totalSaleAmount: 0,
        totalQuantity: 0,
        totalWeight: 0,
        totalKgSent: 0,
      },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/features/trips/components/TripInlineRow", () => ({
  default: ({
    group,
    currentBatchId,
    renderSaleColumns,
    renderHeaderColumns,
  }: {
    group: { movements: any[] };
    currentBatchId: number;
    renderSaleColumns: (movement: any, isOtherBatch: boolean) => React.ReactNode;
    renderHeaderColumns: () => React.ReactNode;
  }) => (
    <div>
      {renderHeaderColumns()}
      {group.movements.map((movement) => (
        <div key={movement.id}>
          {renderSaleColumns(
            movement,
            movement.batchId != null && movement.batchId !== currentBatchId,
          )}
        </div>
      ))}
    </div>
  ),
}));

const movement = {
  id: 1,
  type: "SALE" as const,
  date: "2026-11-19",
  clientName: "Cliente",
  internalClient: false,
  quantity: 10,
  weight: 15,
  kgSent: 15.5,
  saleTotal: 100,
  tripId: 76,
  batchId: 129,
  batchLabel: "Remesa del 2026-11-17",
};

describe("MovementsTable - ventas de otras remesas", () => {
  it("muestra la remesa y oculta el botón de editar en pollo vivo", () => {
    render(
      <ChickenMovementsTable
        movements={[movement]}
        onEdit={vi.fn()}
        unitType="LIVE_CHICKEN"
        batchId={130}
      />,
    );

    expect(screen.getByText("Remesa del 2026-11-17")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Editar" }),
    ).not.toBeInTheDocument();
  });

  it("muestra la remesa y oculta el botón de editar en huevo", () => {
    render(
      <EggMovementsTable
        movements={[movement]}
        onEdit={vi.fn()}
        unitType="EGG"
        batchId={130}
      />,
    );

    expect(screen.getByText("Remesa del 2026-11-17")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Editar" }),
    ).not.toBeInTheDocument();
  });
});
