import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EggMovementsTable } from "../components/egg/EggMovementsTable";

vi.mock("@/features/trips/api/trips.queries", () => ({
  useTripsForBatch: vi.fn(() => ({ data: [], isLoading: false })),
  useTripSales: vi.fn(() => ({ data: [], isLoading: false })),
  useTripSalesByDriverAndDate: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateTrip: vi.fn(() => ({ mutate: vi.fn() })),
  useUpdateTrip: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@/features/trips/components/TripInlineRow", () => ({
  default: ({ group, renderSaleColumns, renderHeaderColumns }: any) => (
    <div data-testid="trip-inline-row">
      <div>{renderHeaderColumns()}</div>
      {group.movements.map((mov: any) => (
        <div key={mov.id} data-testid={`movement-${mov.id}`}>
          {renderSaleColumns(mov, false)}
        </div>
      ))}
    </div>
  ),
}));

const regularSale = {
  id: 1,
  type: "SALE",
  date: "2026-01-15",
  concept: "Cliente: Juan Perez",
  quantity: 360,
  saleTotal: 1800,
  metadata: { boxes: "1", cartons: "0", loose_pieces: "0" },
};

const brokenEggSale = {
  id: 2,
  type: "SALE",
  date: "2026-01-15",
  concept: "Cliente: Panaderia Luna",
  quantity: 180,
  saleTotal: 450,
  metadata: {
    boxes: "0",
    cartons: "6",
    loose_pieces: "0",
    brokenEggs: true,
  },
};

const adjustment = {
  id: 3,
  type: "ADJUSTMENT",
  date: "2026-01-15",
  concept: "Baja: ROTURA",
  quantity: 30,
  weight: 1.5,
  reason: "ROTURA",
};

function renderTable(movements: any[]) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <EggMovementsTable
          movements={movements}
          onEdit={vi.fn()}
          unitType="EGG"
          batchId={1}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("EggMovementsTable - Broken Egg Badge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows broken egg badge when metadata.brokenEggs is true", () => {
    renderTable([brokenEggSale]);
    expect(screen.getByText("🥚 Roto")).toBeInTheDocument();
  });

  it("does not show broken egg badge for regular sales", () => {
    renderTable([regularSale]);
    expect(screen.queryByText("🥚 Roto")).not.toBeInTheDocument();
  });

  it("shows adjustment reason for ADJUSTMENT type", () => {
    renderTable([adjustment]);
    expect(screen.getByText(/ROTURA/)).toBeInTheDocument();
  });

  it("renders empty state when no movements", () => {
    renderTable([]);
    expect(
      screen.getByText("Aún no hay ventas ni bajas registradas."),
    ).toBeInTheDocument();
  });

  it("renders both regular and broken egg sales together", () => {
    renderTable([regularSale, brokenEggSale]);
    expect(screen.getByText("🥚 Roto")).toBeInTheDocument();
    expect(screen.getAllByText("Editar").length).toBe(2);
  });

  it("shows edit buttons for all sales", () => {
    renderTable([regularSale, brokenEggSale]);
    const editButtons = screen.getAllByText("Editar");
    expect(editButtons.length).toBe(2);
  });

  it("renders multiple movements with different types", () => {
    renderTable([regularSale, brokenEggSale, adjustment]);
    expect(screen.getByText("🥚 Roto")).toBeInTheDocument();
    expect(screen.getByText(/ROTURA/)).toBeInTheDocument();
    expect(screen.getAllByText("Editar").length).toBeGreaterThanOrEqual(2);
  });
});
