import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RouteFormModal } from "../components/RouteFormModal";

const mocks = vi.hoisted(() => ({
  useRoute: vi.fn(),
  useCreateRoute: vi.fn(),
  useUpdateRoute: vi.fn(),
  useLocalities: vi.fn(),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: vi.fn(() => ({ data: [], isLoading: false })),
  useRoute: mocks.useRoute,
  useCreateRoute: mocks.useCreateRoute,
  useUpdateRoute: mocks.useUpdateRoute,
  useDeleteRoute: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useReactivateRoute: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useRoutePerformance: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock("@/core/locality/api/locality.queries", () => ({
  useLocalities: mocks.useLocalities,
}));

const localities = [
  { id: 1, name: "Centro", active: true },
  { id: 2, name: "Sur", active: true },
];

describe("RouteFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useRoute.mockReturnValue({ data: undefined, isLoading: false });
    mocks.useCreateRoute.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.useUpdateRoute.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.useLocalities.mockReturnValue({ data: localities, isLoading: false });
  });

  it("envía localidades y días de entrega al crear", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mocks.useCreateRoute.mockReturnValue({ mutateAsync, isPending: false });

    render(<RouteFormModal show routeIdToEdit={null} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Ruta Centro" },
    });

    fireEvent.focus(screen.getByPlaceholderText("Buscar localidad"));
    fireEvent.click(screen.getByRole("button", { name: "Centro" }));
    fireEvent.focus(screen.getByPlaceholderText("Buscar localidad"));
    fireEvent.click(screen.getByRole("button", { name: "Sur" }));

    fireEvent.click(screen.getByRole("button", { name: "Lun" }));
    fireEvent.click(screen.getByRole("button", { name: "Mie" }));

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        name: "Ruta Centro",
        localityIds: [1, 2],
        deliveryDays: [1, 3],
      }),
    );
  });

  it("precarga localidades y días al editar", async () => {
    mocks.useRoute.mockReturnValue({
      data: {
        id: 7,
        name: "Ruta Sur",
        active: true,
        localityIds: [2],
        deliveryDays: [5],
      },
      isLoading: false,
    });
    const updateMutate = vi.fn().mockResolvedValue({});
    mocks.useUpdateRoute.mockReturnValue({
      mutateAsync: updateMutate,
      isPending: false,
    });

    render(<RouteFormModal show routeIdToEdit={7} onClose={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Vie", pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sur")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(updateMutate).toHaveBeenCalledWith({
        id: 7,
        payload: {
          name: "Ruta Sur",
          localityIds: [2],
          deliveryDays: [5],
        },
      }),
    );
  });

  it("quita una localidad seleccionada", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mocks.useCreateRoute.mockReturnValue({ mutateAsync, isPending: false });

    render(<RouteFormModal show routeIdToEdit={null} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Ruta Centro" },
    });
    fireEvent.focus(screen.getByPlaceholderText("Buscar localidad"));
    fireEvent.click(screen.getByRole("button", { name: "Centro" }));
    fireEvent.click(screen.getByRole("button", { name: "Quitar Centro" }));
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        name: "Ruta Centro",
        localityIds: [],
        deliveryDays: [],
      }),
    );
  });

  it("valida el nombre obligatorio", () => {
    const mutateAsync = vi.fn();
    mocks.useCreateRoute.mockReturnValue({ mutateAsync, isPending: false });

    render(<RouteFormModal show routeIdToEdit={null} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
