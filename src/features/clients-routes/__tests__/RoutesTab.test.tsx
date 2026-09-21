import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RoutesTab } from "../components/RoutesTab";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  const { MockResponsiveContainer } = await import("@/test/rechartsMock");
  return {
    ...actual,
    ResponsiveContainer: MockResponsiveContainer,
  };
});

vi.mock("../components/DateRangeFields", () => ({
  DateRangeFields: () => (
    <div>
      <label htmlFor="mock-from">Desde</label>
      <input id="mock-from" />
      <label htmlFor="mock-to">Hasta</label>
      <input id="mock-to" />
    </div>
  ),
}));

const mocks = vi.hoisted(() => ({
  useRoutes: vi.fn(),
  useDeleteRoute: vi.fn(),
  useReactivateRoute: vi.fn(),
  useRoutePerformance: vi.fn(),
  useLocalities: vi.fn(),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: mocks.useRoutes,
  useRoute: vi.fn(() => ({ data: undefined, isLoading: false })),
  useCreateRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteRoute: mocks.useDeleteRoute,
  useReactivateRoute: mocks.useReactivateRoute,
  useRoutePerformance: mocks.useRoutePerformance,
}));

vi.mock("@/core/locality/api/locality.queries", () => ({
  useLocalities: mocks.useLocalities,
}));

const activeRoute = {
  id: 1,
  name: "Ruta Centro",
  active: true,
  localityIds: [1],
  deliveryDays: [1, 3],
};

const inactiveRoute = {
  id: 2,
  name: "Ruta Norte",
  active: false,
  localityIds: [2],
  deliveryDays: [],
};

describe("RoutesTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useRoutes.mockImplementation((includeInactive = false) => ({
      data: includeInactive ? [activeRoute, inactiveRoute] : [activeRoute],
      isLoading: false,
      isError: false,
      error: null,
    }));
    mocks.useDeleteRoute.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.useReactivateRoute.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.useRoutePerformance.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    mocks.useLocalities.mockReturnValue({
      data: [
        { id: 1, name: "Centro", active: true },
        { id: 2, name: "Norte", active: true },
      ],
      isLoading: false,
    });
  });

  it("muestra localidades y días de entrega de cada ruta", () => {
    render(<RoutesTab unitType="EGG" />);

    expect(screen.getByText("Ruta Centro")).toBeInTheDocument();
    expect(screen.getByText("Centro")).toBeInTheDocument();
    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Mie")).toBeInTheDocument();
    expect(screen.queryByText("Ruta Norte")).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("¿Cómo se asignan las localidades?"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("¿Qué significan los días de entrega?"),
    ).toBeInTheDocument();
  });

  it("muestra rutas inactivas y permite reactivarlas", async () => {
    const reactivate = vi.fn().mockResolvedValue({});
    mocks.useReactivateRoute.mockReturnValue({
      mutateAsync: reactivate,
      isPending: false,
    });

    render(<RoutesTab unitType="EGG" />);

    fireEvent.click(screen.getByLabelText("Mostrar inactivas"));

    expect(await screen.findByText("Ruta Norte")).toBeInTheDocument();
    expect(screen.getByText("Inactiva")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reactivar" }));

    await waitFor(() => expect(reactivate).toHaveBeenCalledWith(2));
  });

  it("filtra rutas por nombre", () => {
    mocks.useRoutes.mockReturnValue({
      data: [
        activeRoute,
        {
          id: 3,
          name: "Ruta Sur",
          active: true,
          localityIds: [],
          deliveryDays: [],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<RoutesTab unitType="EGG" />);

    fireEvent.change(screen.getByPlaceholderText("Buscar ruta"), {
      target: { value: "sur" },
    });

    expect(screen.queryByText("Ruta Centro")).not.toBeInTheDocument();
    expect(screen.getByText("Ruta Sur")).toBeInTheDocument();
  });

  it("elimina una ruta con confirmación", async () => {
    const deleteMutate = vi.fn().mockResolvedValue(undefined);
    mocks.useDeleteRoute.mockReturnValue({
      mutateAsync: deleteMutate,
      isPending: false,
    });

    render(<RoutesTab unitType="EGG" />);

    fireEvent.click(screen.getByTitle("Eliminar"));
    fireEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }));

    await waitFor(() => expect(deleteMutate).toHaveBeenCalledWith(1));
  });

  it("abre el modal de rendimiento por ruta", async () => {
    render(<RoutesTab unitType="EGG" />);

    fireEvent.click(screen.getByRole("button", { name: "Rendimiento" }));

    expect(
      await screen.findByText("Rendimiento y rentabilidad por ruta"),
    ).toBeInTheDocument();
  });

  it("abre rendimiento con el periodo inicial recibido", () => {
    render(
      <RoutesTab
        unitType="EGG"
        initialPerformancePeriod={{
          from: new Date(2032, 0, 1),
          to: new Date(2032, 0, 31),
        }}
      />,
    );

    expect(
      screen.getByText("Rendimiento y rentabilidad por ruta"),
    ).toBeInTheDocument();
    expect(mocks.useRoutePerformance).toHaveBeenLastCalledWith(
      "2032-01-01",
      "2032-01-31",
    );
  });
});
