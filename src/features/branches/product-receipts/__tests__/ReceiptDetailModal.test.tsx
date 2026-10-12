import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReceiptDetailModal from "../components/ReceiptDetailModal";

const recordCost = vi.fn();
const resolveLine = vi.fn();
const resolveWithProduct = vi.fn();

const detail = {
  id: 11,
  branchId: 2,
  branchName: "Sucursal Dos",
  receivedAt: "2026-09-15T10:00:00Z",
  createdAt: "2026-09-15T11:00:00Z",
  recorderName: "María López",
  lines: [
    {
      id: 101,
      lineNumber: 1,
      productBarcode: "A1",
      productName: "Frijol negro",
      sourceBarcode: "A1",
      observedName: null,
      quantity: 5,
      unitName: "Kilo",
      unitId: 1,
      toProductUnitFactor: 1,
      latestCost: null,
      costHistory: [],
    },
    {
      id: 102,
      lineNumber: 2,
      productBarcode: null,
      productName: null,
      sourceBarcode: "7501234567890",
      observedName: "Azúcar a granel",
      quantity: 2,
      unitName: "Kilo",
      unitId: null,
      toProductUnitFactor: null,
      latestCost: null,
      costHistory: [],
    },
    {
      id: 103,
      lineNumber: 3,
      productBarcode: "T1",
      productName: "Té negro",
      sourceBarcode: "T1",
      observedName: null,
      quantity: 10,
      unitName: "piezas",
      unitId: 2,
      toProductUnitFactor: 1,
      latestCost: null,
      costHistory: [],
    },
  ],
};

vi.mock("../api/product-receipts.queries", () => ({
  useReceiptDetail: vi.fn(() => ({ data: detail, isLoading: false, isError: false })),
  useRecordCost: vi.fn(() => ({ mutate: recordCost, isPending: false, isError: false })),
  useResolveLine: vi.fn(() => ({ mutate: resolveLine, isPending: false, isError: false })),
  useResolveWithProduct: vi.fn(() => ({
    mutate: resolveWithProduct,
    isPending: false,
    isError: false,
  })),
  useCatalogProducts: vi.fn(() => ({
    data: [
      { barcode: "A1", name: "Frijol negro", status: "ACTIVE" },
      { barcode: "IT-9", name: "IT Prueba", status: "ACTIVE" },
      { barcode: "P1", name: "Pendiente", status: "PENDING" },
    ],
  })),
}));

vi.mock("../../product/api/categories.queries", () => ({
  useCategories: vi.fn(() => ({
    data: [{ id: 10, name: "Verduras" }],
  })),
}));

vi.mock("../../product/api/measurementUnits.queries", () => ({
  useMeasurementUnits: vi.fn(() => ({
    data: [{ id: 1, name: "Kilo" }],
  })),
}));

function renderModal() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ReceiptDetailModal receiptId={11} onClose={() => undefined} />
    </QueryClientProvider>,
  );
}

describe("ReceiptDetailModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows pending-cost and unresolved states without implying zero cost", () => {
    renderModal();

    expect(screen.getAllByText("Sin costo").length).toBeGreaterThan(0);
    expect(screen.getByText("Sin resolver")).toBeInTheDocument();
    expect(screen.queryByText(/\$0\.00/)).not.toBeInTheDocument();
  });

  it("locks the received unit instead of an editable field", () => {
    renderModal();

    expect(screen.getAllByText("por Kilo").length).toBeGreaterThan(0);
    expect(screen.queryByPlaceholderText("Kilo")).not.toBeInTheDocument();
  });

  it("saves a unit cost with only the amount", () => {
    renderModal();

    const saveButtons = screen.getAllByRole("button", { name: "Guardar costo" });
    expect(saveButtons[0]).toBeDisabled();

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    fireEvent.change(amountInputs[0], { target: { value: "42.50" } });

    expect(saveButtons[0]).not.toBeDisabled();
    fireEvent.click(saveButtons[0]);
    expect(recordCost).toHaveBeenCalledWith(
      {
        lineId: 101,
        payload: { unitCost: 42.5, costUnit: "Kilo", toLineUnitFactor: null },
      },
      expect.anything(),
    );
  });

  it("rejects a negative cost amount", () => {
    renderModal();

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    fireEvent.change(amountInputs[0], { target: { value: "-5" } });

    expect(screen.getAllByRole("button", { name: "Guardar costo" })[0]).toBeDisabled();
  });

  it("shows both prices live in package mode and saves the package cost", () => {
    renderModal();

    const toggles = screen.getAllByRole("checkbox");
    fireEvent.click(toggles[0]);

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    fireEvent.change(amountInputs[0], { target: { value: "850" } });

    expect(screen.getAllByRole("button", { name: "Guardar costo" })[0]).toBeDisabled();

    fireEvent.change(
      screen.getAllByPlaceholderText(/1 caja = 12 Kilo, escribe 12/)[0],
      { target: { value: "50" } },
    );

    expect(screen.getByText(/\$850\.00 por paquete/)).toBeInTheDocument();
    expect(screen.getByText(/\$17\.00 por Kilo/)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Guardar costo" })[0]);
    expect(recordCost).toHaveBeenCalledWith(
      {
        lineId: 101,
        payload: { unitCost: 850, costUnit: "paquete", toLineUnitFactor: 50 },
      },
      expect.anything(),
    );
  });

  it("explains the package equivalence", () => {
    renderModal();

    expect(
      screen.getAllByText("Es precio por paquete (caja/bulto)").length,
    ).toBeGreaterThan(0);
  });

  it("shows singular and gender-neutral wording for plural units", () => {
    renderModal();

    expect(screen.getByText("por pieza")).toBeInTheDocument();

    const toggles = screen.getAllByRole("checkbox");
    fireEvent.click(toggles[2]);

    expect(
      screen.getByText("¿A cuántas unidades equivale el paquete?"),
    ).toBeInTheDocument();
  });

  it("searches the catalog and links the selected product", () => {
    renderModal();

    expect(screen.queryByPlaceholderText("A unidad del producto")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Código o nombre"), {
      target: { value: "frijol" },
    });
    fireEvent.click(screen.getByRole("button", { name: /A1 — Frijol negro/ }));
    fireEvent.click(screen.getByRole("button", { name: "Vincular producto" }));

    expect(resolveLine).toHaveBeenCalledWith({
      lineId: 102,
      payload: { productBarcode: "A1", toProductUnitFactor: null },
    });
  });

  it("creates and links a missing product with prefilled values", () => {
    resolveWithProduct.mockImplementation((_variables, options) =>
      options?.onSuccess?.({ line: detail.lines[1], productCreated: true }),
    );
    renderModal();

    fireEvent.change(screen.getByPlaceholderText("Código o nombre"), {
      target: { value: "azúcar" },
    });
    expect(screen.getByText("Sin coincidencias en el catálogo.")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "No es ninguno: crear producto" }),
    );

    expect(screen.getByDisplayValue("Azúcar a granel")).toBeInTheDocument();
    expect(screen.getByDisplayValue("7501234567890")).toBeInTheDocument();

    const [categorySelect] = screen.getAllByRole("combobox");
    fireEvent.change(categorySelect, { target: { value: "10" } });

    fireEvent.click(screen.getByRole("button", { name: "Crear y vincular" }));

    expect(resolveWithProduct).toHaveBeenCalledWith(
      {
        lineId: 102,
        payload: {
          productBarcode: "7501234567890",
          name: "Azúcar a granel",
          categoryId: 10,
          unitId: 1,
        },
      },
      expect.anything(),
    );
    expect(screen.getByText("Producto creado y vinculado.")).toBeInTheDocument();
  });
});
