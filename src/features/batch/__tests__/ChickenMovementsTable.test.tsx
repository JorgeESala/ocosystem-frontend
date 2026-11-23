import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChickenMovementsTable } from "../components/live-chicken/ChickenMovementsTable";

const mocks = vi.hoisted(() => ({
  trip: {
    id: 1,
    driverId: 1,
    driverName: "Jorge",
    routeId: 1,
    routeName: "Señor",
    departureDate: "2026-11-19",
    totalKgLoaded: 482.5,
    salesCount: 2,
    totalSaleAmount: 26495.7,
    totalQuantity: 200,
    totalWeight: 630.85,
    totalKgSent: 630.85,
    batchSources: [],
  },
  currentSale: {
    id: 101,
    tripId: 1,
    batchId: 1,
    batchLabel: "Remesa del 2026-11-19",
    clientId: 7,
    clientName: "RONELI",
    internalClient: false,
    saleDate: "2026-11-19",
    weight: 260.15,
    kgSent: 260.15,
    quantity: 80,
    saleTotal: 10926.3,
  },
  otherSale: {
    id: 102,
    tripId: 1,
    batchId: 2,
    batchLabel: "Remesa del 2026-11-18",
    clientId: 7,
    clientName: "RONELI",
    internalClient: false,
    saleDate: "2026-11-19",
    weight: 370.7,
    kgSent: 370.7,
    quantity: 120,
    saleTotal: 15569.4,
  },
}));

vi.mock("@/features/trips/api/trips.queries", () => ({
  useTripsForBatch: vi.fn(() => ({ data: [mocks.trip], isLoading: false })),
  useTripSales: vi.fn(() => ({
    data: [mocks.currentSale, mocks.otherSale],
    isLoading: false,
  })),
  useUpdateTrip: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCreateTrip: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: vi.fn(() => ({ data: [] })),
  useCreateRoute: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("@/features/batch/api/batch.queries", () => ({
  useBulkUpdateBatchSaleRoute: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

const currentMovement = {
  id: 101,
  type: "SALE",
  date: "2026-11-19",
  employeeId: 1,
  employeeName: "Jorge",
  tripId: 1,
  batchId: 1,
  clientId: 7,
  clientName: "RONELI",
  concept: "Cliente: RONELI",
  internalClient: false,
  quantity: 80,
  weight: 260.15,
  kgSent: 260.15,
  saleTotal: 10926.3,
};

function renderTable() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/business/pollo-vivo/batches/1"]}>
        <Routes>
          <Route
            path="/business/:slug/*"
            element={
              <ChickenMovementsTable
                movements={[currentMovement]}
                onEdit={vi.fn()}
                unitType="LIVE_CHICKEN"
                batchId={1}
                tripId={1}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ChickenMovementsTable - other remesa sales", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("labels the other remesa by id and links to it instead of editing", () => {
    renderTable();

    expect(screen.getByText("RONELI · Remesa #2")).toBeInTheDocument();
    expect(
      screen.getByText("Ventas de otras remesas (incluidas en el viaje)"),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /Ver remesa #2/ });
    expect(link).toHaveAttribute(
      "href",
      "/business/pollo-vivo/salesAndBatches?batch=2&tripId=1",
    );

    expect(screen.getAllByRole("button", { name: "Editar" })).toHaveLength(1);
  });
});
