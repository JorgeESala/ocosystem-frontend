import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BatchMovementModal } from "../components/BatchMovementModal";
import type { Batch } from "../types.batch";

const { employeesData } = vi.hoisted(() => ({
  employeesData: [{ id: 1, name: "Juan Perez" }],
}));

const routeMocks = vi.hoisted(() => ({
  useRoutes: vi.fn(),
  useCreateRoute: vi.fn(),
}));

const batchMocks = vi.hoisted(() => ({
  createSaleMutate: vi.fn(),
  updateSaleMutate: vi.fn(),
}));

const clientMocks = vi.hoisted(() => ({
  useClients: vi.fn(),
  useCreateClient: vi.fn(),
  useCreateInternalClient: vi.fn(),
}));

vi.mock("@/features/employee/api/employees.queries", () => ({
  useEmployees: vi.fn(() => ({
    data: employeesData,
    isLoading: false,
  })),
}));

vi.mock("@/core/client/api/client.queries", () => ({
  useClients: clientMocks.useClients,
  useCreateClient: clientMocks.useCreateClient,
  useCreateInternalClient: clientMocks.useCreateInternalClient,
}));

vi.mock("@/core/locality/api/locality.queries", () => ({
  useLocalities: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: routeMocks.useRoutes,
  useCreateRoute: routeMocks.useCreateRoute,
}));

vi.mock("../api/batch.queries", () => ({
  useCreateBatchSale: vi.fn(() => ({ mutate: batchMocks.createSaleMutate })),
  useUpdateBatchSale: vi.fn(() => ({ mutate: batchMocks.updateSaleMutate })),
}));

vi.mock("../api/batch.adjustments.queries", () => ({
  useCreateAdjustment: vi.fn(() => ({ mutate: vi.fn() })),
  useUpdateBatchAdjustment: vi.fn(() => ({ mutate: vi.fn() })),
}));

beforeEach(() => {
  routeMocks.useRoutes.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  routeMocks.useCreateRoute.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  });
  clientMocks.useClients.mockReturnValue({ data: [] });
  clientMocks.useCreateClient.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  });
  clientMocks.useCreateInternalClient.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  });
});

const eggBatch: Batch = {
  id: 1,
  type: "EGG",
  supplierId: 1,
  supplierName: "Proveedor A",
  cedisId: 1,
  cedisName: "CEDIS Principal",
  entryDate: "2026-01-15",
  totalAmount: "505",
  metadata: { pricePerKg: 22 },
  initialQuantity: "3600",
  soldQuantity: "0",
  remainingQuantity: "3600",
  remainingBoxes: 10,
  remainingCartons: 0,
  remainingPieces: 0,
};

const chickenBatch: Batch = {
  id: 2,
  type: "LIVE_CHICKEN",
  supplierId: 2,
  supplierName: "Proveedor B",
  cedisId: 1,
  cedisName: "CEDIS Principal",
  entryDate: "2026-01-15",
  totalAmount: "50000",
  metadata: { pricePerKg: 22 },
  initialQuantity: "692",
  soldQuantity: "0",
  remainingQuantity: "692",
  remainingBoxes: 0,
  remainingCartons: 0,
  remainingPieces: 0,
};

function renderModal(batch: Batch) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <BatchMovementModal batch={batch} onClose={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe("BatchMovementModal - Broken Eggs Checkbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows broken eggs checkbox for EGG batches when movement type is SALE", () => {
    renderModal(eggBatch);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("hides broken eggs checkbox for non-EGG batches", () => {
    renderModal(chickenBatch);
    expect(screen.queryByText(/Huevos rotos/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Venta de huevos rotos/)).not.toBeInTheDocument();
  });

  it("checkbox is unchecked by default for new sales", () => {
    renderModal(eggBatch);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("checkbox can be toggled on", () => {
    renderModal(eggBatch);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("checkbox can be toggled off after being toggled on", () => {
    renderModal(eggBatch);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("hides broken eggs checkbox when movement type is ADJUSTMENT", () => {
    renderModal(eggBatch);
    const adjustmentRadio = screen.getByLabelText("Baja / Ajuste");
    fireEvent.click(adjustmentRadio);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByText(/Venta de huevos rotos/)).not.toBeInTheDocument();
  });
});

describe("BatchMovementModal - Pre-populated brokenEggs when editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checkbox is pre-checked when editing a sale with brokenEggs=true", () => {
    const initialData = {
      id: 10,
      type: "SALE",
      date: "2026-01-15",
      quantity: "100",
      saleTotal: "500",
      metadata: { brokenEggs: true, boxes: "2", cartons: "0" },
    };

    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={qc}>
        <BatchMovementModal
          batch={eggBatch}
          onClose={vi.fn()}
          initialData={initialData}
        />
      </QueryClientProvider>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("checkbox is unchecked when editing a sale without brokenEggs", () => {
    const initialData = {
      id: 11,
      type: "SALE",
      date: "2026-01-15",
      quantity: "100",
      saleTotal: "500",
      metadata: { boxes: "2", cartons: "0" },
    };

    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={qc}>
        <BatchMovementModal
          batch={eggBatch}
          onClose={vi.fn()}
          initialData={initialData}
        />
      </QueryClientProvider>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });
});

function renderEditModal(initialData: Record<string, unknown>) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <BatchMovementModal
        batch={eggBatch}
        onClose={vi.fn()}
        initialData={initialData}
      />
    </QueryClientProvider>,
  );
}

describe("BatchMovementModal - Ruta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra la ruta guardada aunque no esté en la lista y la conserva al guardar", async () => {
    routeMocks.useRoutes.mockReturnValue({
      data: [{ id: 1, name: "Ruta Nueva" }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderEditModal({
      id: 10,
      type: "SALE",
      date: "2026-01-15",
      routeId: 7,
      routeName: "Ruta Vieja",
      employeeId: 1,
      quantity: "100",
      saleTotal: "500",
      metadata: { boxes: "2", cartons: "0" },
    });

    expect(screen.getByDisplayValue("Ruta Vieja")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Guardar Cambios" }));

    await waitFor(() =>
      expect(batchMocks.updateSaleMutate).toHaveBeenCalledTimes(1),
    );
    const payload = batchMocks.updateSaleMutate.mock.calls[0][0].data;
    expect(payload.routeId).toBe(7);
  });

  it("pide seleccionar ruta antes de guardar una venta sin ruta", async () => {
    routeMocks.useRoutes.mockReturnValue({
      data: [{ id: 1, name: "Ruta Nueva" }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderEditModal({
      id: 11,
      type: "SALE",
      date: "2026-01-15",
      employeeId: 1,
      quantity: "100",
      saleTotal: "500",
      metadata: { boxes: "2", cartons: "0" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar Cambios" }));

    await waitFor(() =>
      expect(screen.getByText("Ruta: Selecciona una ruta")).toBeInTheDocument(),
    );
    expect(batchMocks.updateSaleMutate).not.toHaveBeenCalled();
  });

  it("muestra error y permite reintentar cuando fallan las rutas", () => {
    const refetch = vi.fn();
    routeMocks.useRoutes.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch,
    });

    renderModal(eggBatch);

    const routeInput = screen.getByPlaceholderText(
      "No se pudieron cargar las rutas",
    );
    fireEvent.focus(routeInput);

    expect(
      screen.getByText(/No se pudieron cargar las rutas/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

describe("BatchMovementModal - Recogida en CEDIS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const internalClient = {
    id: 7,
    name: "Cliente Recoge",
    businessName: null,
    localityName: null,
    isInternalBranch: false,
    isInternalClient: true,
  };
  const externalClient = {
    id: 8,
    name: "Cliente Externo",
    businessName: null,
    localityName: null,
    isInternalBranch: false,
    isInternalClient: false,
  };
  const branchClient = {
    id: 9,
    name: "Sucursal Norte",
    businessName: null,
    localityName: null,
    isInternalBranch: true,
    isInternalClient: false,
  };

  function selectClient(name: string) {
    fireEvent.focus(
      screen.getByPlaceholderText("Escribe para buscar cliente..."),
    );
    fireEvent.click(screen.getByText(name));
  }

  it("muestra la opción de recogida al seleccionar un cliente interno", () => {
    clientMocks.useClients.mockReturnValue({ data: [internalClient] });
    renderModal(chickenBatch);
    expect(screen.queryByText("Recoge en CEDIS")).not.toBeInTheDocument();
    selectClient("Cliente Recoge");
    expect(screen.getByText("Recoge en CEDIS")).toBeInTheDocument();
  });

  it("no muestra la opción para mostrador, externos ni sucursales", () => {
    clientMocks.useClients.mockReturnValue({
      data: [internalClient, externalClient, branchClient],
    });
    renderModal(chickenBatch);
    expect(screen.queryByText("Recoge en CEDIS")).not.toBeInTheDocument();

    selectClient("Cliente Externo");
    expect(screen.queryByText("Recoge en CEDIS")).not.toBeInTheDocument();

    selectClient("Sucursal Norte");
    expect(screen.queryByText("Recoge en CEDIS")).not.toBeInTheDocument();
  });

  it("muestra la opción de recogida en huevo al seleccionar un cliente interno", () => {
    clientMocks.useClients.mockReturnValue({ data: [internalClient] });
    renderModal(eggBatch);
    expect(screen.queryByText("Recoge en CEDIS")).not.toBeInTheDocument();
    selectClient("Cliente Recoge");
    expect(screen.getByText("Recoge en CEDIS")).toBeInTheDocument();
  });

  it("deshabilita la ruta de huevo al marcar recogida", () => {
    clientMocks.useClients.mockReturnValue({ data: [internalClient] });
    renderModal(eggBatch);
    selectClient("Cliente Recoge");
    fireEvent.click(screen.getByLabelText("Recoge en CEDIS"));
    expect(
      screen.getByPlaceholderText("No aplica en recogida en CEDIS"),
    ).toBeInTheDocument();
  });

  it("deshabilita la ruta al marcar recogida", () => {
    clientMocks.useClients.mockReturnValue({ data: [internalClient] });
    renderModal(chickenBatch);
    selectClient("Cliente Recoge");
    fireEvent.click(screen.getByLabelText("Recoge en CEDIS"));
    expect(
      screen.getByPlaceholderText("No aplica en recogida en CEDIS"),
    ).toBeInTheDocument();
  });

  it("desmarca la recogida al cambiar a un cliente no interno", () => {
    clientMocks.useClients.mockReturnValue({
      data: [internalClient, externalClient],
    });
    renderModal(chickenBatch);
    selectClient("Cliente Recoge");
    fireEvent.click(screen.getByLabelText("Recoge en CEDIS"));
    selectClient("Cliente Externo");
    expect(screen.queryByText("Recoge en CEDIS")).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar o seleccionar ruta..."),
    ).toBeInTheDocument();
  });

  it("ofrece marcar al cliente nuevo como interno", () => {
    renderModal(chickenBatch);
    fireEvent.click(screen.getByRole("button", { name: "Nuevo Cliente" }));
    expect(screen.getByText("Cliente interno")).toBeInTheDocument();
  });
});
