import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReceiptDetailModal from "../components/ReceiptDetailModal";

const recordCost = vi.fn();
const resolveLine = vi.fn();

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
  ],
};

vi.mock("../api/product-receipts.queries", () => ({
  useReceiptDetail: vi.fn(() => ({ data: detail, isLoading: false, isError: false })),
  useRecordCost: vi.fn(() => ({ mutate: recordCost, isPending: false, isError: false })),
  useResolveLine: vi.fn(() => ({ mutate: resolveLine, isPending: false, isError: false })),
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

  it("disables cost save until amount and unit are valid", () => {
    renderModal();

    const saveButtons = screen.getAllByRole("button", { name: "Guardar costo" });
    expect(saveButtons[0]).toBeDisabled();

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    fireEvent.change(amountInputs[0], { target: { value: "42.50" } });
    const unitInputs = screen.getAllByPlaceholderText("Kilo");
    fireEvent.change(unitInputs[0], { target: { value: "Kilo" } });

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
    const unitInputs = screen.getAllByPlaceholderText("Kilo");
    fireEvent.change(unitInputs[0], { target: { value: "Kilo" } });

    expect(screen.getAllByRole("button", { name: "Guardar costo" })[0]).toBeDisabled();
  });

  it("resolves an unresolved line with an explicit barcode", () => {
    renderModal();

    fireEvent.change(screen.getByPlaceholderText("Código de barras"), {
      target: { value: "A1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Vincular producto" }));

    expect(resolveLine).toHaveBeenCalledWith({
      lineId: 102,
      payload: { productBarcode: "A1", toProductUnitFactor: null },
    });
  });
});
