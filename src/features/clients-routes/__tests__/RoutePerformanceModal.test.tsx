import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { RoutePerformanceModal } from "../components/RoutePerformanceModal";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  const { MockResponsiveContainer } = await import("@/test/rechartsMock");
  return {
    ...actual,
    ResponsiveContainer: MockResponsiveContainer,
  };
});

vi.mock("../components/DateRangeFields", () => ({
  DateRangeFields: ({
    from,
    to,
    onChange,
  }: {
    from: Date | null;
    to: Date | null;
    onChange: (from: Date | null, to: Date | null) => void;
  }) => {
    const toValue = (date: Date | null) => {
      if (!date) return "";
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${date.getFullYear()}-${month}-${day}`;
    };
    return (
      <div>
        <label htmlFor="mock-from">Desde</label>
        <input
          id="mock-from"
          value={toValue(from)}
          onChange={(e) =>
            onChange(
              e.target.value ? new Date(`${e.target.value}T00:00:00`) : null,
              to,
            )
          }
        />
        <label htmlFor="mock-to">Hasta</label>
        <input
          id="mock-to"
          value={toValue(to)}
          onChange={(e) =>
            onChange(
              from,
              e.target.value ? new Date(`${e.target.value}T00:00:00`) : null,
            )
          }
        />
      </div>
    );
  },
}));

const mocks = vi.hoisted(() => ({
  useRoutePerformance: vi.fn(),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: vi.fn(() => ({ data: [], isLoading: false })),
  useRoute: vi.fn(() => ({ data: undefined, isLoading: false })),
  useCreateRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useReactivateRoute: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useRoutePerformance: mocks.useRoutePerformance,
}));

const routes = [
  {
    id: 1,
    name: "Ruta Centro",
    active: true,
    localityIds: [1],
    deliveryDays: [1],
  },
  {
    id: 3,
    name: "Ruta Sur",
    active: true,
    localityIds: [],
    deliveryDays: [],
  },
];

describe("RoutePerformanceModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useRoutePerformance.mockReturnValue({
      data: [
        {
          routeId: 1,
          routeName: "Ruta Centro",
          totalQuantity: 150,
          totalSales: 1500,
          cogs: 150,
          fuelExpense: 250,
          profit: 1100,
          marginPct: 73.33,
          saleCount: 3,
        },
        {
          routeId: null,
          routeName: null,
          totalQuantity: 10,
          totalSales: 100,
          cogs: 10,
          fuelExpense: 0,
          profit: 90,
          marginPct: 90,
          saleCount: 1,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("muestra rentabilidad por ruta: costo, combustible, utilidad y margen", () => {
    render(
      <RoutePerformanceModal
        show
        onClose={vi.fn()}
        unitType="EGG"
        routes={routes}
      />,
    );

    expect(
      screen.getByText("Rendimiento y rentabilidad por ruta"),
    ).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getByText("Ruta Centro")).toBeInTheDocument();
    expect(within(table).getByText("Sin ruta")).toBeInTheDocument();
    expect(within(table).getByText("Ruta Sur")).toBeInTheDocument();
    expect(within(table).getByText("$1,500.00")).toBeInTheDocument();
    expect(within(table).getByText("$150.00")).toBeInTheDocument();
    expect(within(table).getByText("$250.00")).toBeInTheDocument();
    expect(within(table).getByText("$1,100.00")).toBeInTheDocument();
    expect(within(table).getByText("73.33%")).toBeInTheDocument();

    expect(screen.getByText("Utilidad total")).toBeInTheDocument();
    expect(screen.getByText("$1,190.00")).toBeInTheDocument();
    expect(
      screen.getByLabelText("¿Cómo se calcula la utilidad?"),
    ).toBeInTheDocument();
  });

  it("cambia el rango de fechas y consulta de nuevo", () => {
    render(
      <RoutePerformanceModal
        show
        onClose={vi.fn()}
        unitType="EGG"
        routes={routes}
      />,
    );

    fireEvent.change(screen.getByLabelText("Desde"), {
      target: { value: "2032-01-01" },
    });

    expect(mocks.useRoutePerformance).toHaveBeenLastCalledWith(
      "2032-01-01",
      expect.any(String),
    );
  });

  it("usa el rango inicial cuando se recibe", () => {
    render(
      <RoutePerformanceModal
        show
        onClose={vi.fn()}
        unitType="EGG"
        routes={routes}
        initialRange={{
          from: new Date(2032, 0, 1),
          to: new Date(2032, 0, 31),
        }}
      />,
    );

    expect(mocks.useRoutePerformance).toHaveBeenLastCalledWith(
      "2032-01-01",
      "2032-01-31",
    );
  });
});
