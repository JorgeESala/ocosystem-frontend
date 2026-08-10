import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BatchMovementModal } from "../components/BatchMovementModal";
import type { Batch } from "../types.batch";

vi.mock("@/features/employee/api/employees.queries", () => ({
  useEmployees: vi.fn(() => ({
    data: [{ id: 1, name: "Juan Perez" }],
    isLoading: false,
  })),
}));

vi.mock("@/core/client/api/client.queries", () => ({
  useClients: vi.fn(() => ({ data: [] })),
  useCreateClient: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("@/core/locality/api/locality.queries", () => ({
  useLocalities: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/core/api/route/routes.queries", () => ({
  useRoutes: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateRoute: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("../api/batch.queries", () => ({
  useCreateBatchSale: vi.fn(() => ({ mutate: vi.fn() })),
  useUpdateBatchSale: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("../api/batch.adjustments.queries", () => ({
  useCreateAdjustment: vi.fn(() => ({ mutate: vi.fn() })),
  useUpdateBatchAdjustment: vi.fn(() => ({ mutate: vi.fn() })),
}));

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
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
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
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
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
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
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
