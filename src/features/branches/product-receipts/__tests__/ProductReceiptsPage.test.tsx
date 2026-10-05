import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductReceiptsPage from "../pages/ProductReceiptsPage";

vi.mock("../../branch/branch.queries", () => ({
  useBranches: vi.fn(() => ({
    data: [{ id: 2, name: "Sucursal Dos" }],
    isLoading: false,
  })),
}));

const useProductReceipts = vi.fn();

vi.mock("../api/product-receipts.queries", () => ({
  useProductReceipts: (...args: unknown[]) => useProductReceipts(...args),
  useReceiptDetail: vi.fn(),
  useRecordCost: vi.fn(),
  useResolveLine: vi.fn(),
}));

vi.mock("../components/ReceiptDetailModal", () => ({
  default: ({ receiptId }: { receiptId: number }) => (
    <div data-testid="receipt-modal">Detalle {receiptId}</div>
  ),
}));

vi.mock("@/components/BranchMultiSelect", () => ({
  default: () => <div />,
}));

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProductReceiptsPage />
    </QueryClientProvider>,
  );
}

const summaries = [
  {
    id: 11,
    branchId: 2,
    branchName: "Sucursal Dos",
    receivedAt: "2026-09-15T10:00:00Z",
    recorderName: "María López",
    lineCount: 2,
    unresolvedCount: 1,
    pendingCostCount: 2,
  },
  {
    id: 10,
    branchId: 2,
    branchName: "Sucursal Dos",
    receivedAt: "2026-09-14T10:00:00Z",
    recorderName: "Juan Pérez",
    lineCount: 1,
    unresolvedCount: 0,
    pendingCostCount: 0,
  },
];

describe("ProductReceiptsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProductReceipts.mockReturnValue({ data: undefined, isLoading: false, isError: false });
  });

  it("asks for a search before listing receipts", () => {
    renderPage();

    expect(screen.getByText("Recepción de productos")).toBeInTheDocument();
    expect(screen.getByText(/presiona Buscar/)).toBeInTheDocument();
    expect(useProductReceipts).toHaveBeenCalledWith(null);
  });

  it("lists receipts with pending-cost and unresolved states", () => {
    useProductReceipts.mockReturnValue({ data: summaries, isLoading: false, isError: false });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(screen.getByText("#11")).toBeInTheDocument();
    expect(screen.getByText("Sin costo (2)")).toBeInTheDocument();
    expect(screen.getByText("Sin resolver (1)")).toBeInTheDocument();
    expect(screen.getByText("Con costo")).toBeInTheDocument();
  });

  it("does not search without a date range", () => {
    renderPage();

    const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(dateInputs[0], { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(screen.getByText(/presiona Buscar/)).toBeInTheDocument();
  });

  it("opens the receipt detail when a row is clicked", () => {
    useProductReceipts.mockReturnValue({ data: summaries, isLoading: false, isError: false });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    fireEvent.click(screen.getByText("#11"));

    expect(screen.getByTestId("receipt-modal")).toHaveTextContent("Detalle 11");
  });

  it("shows an error state when loading fails", () => {
    useProductReceipts.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(screen.getByText("No se pudieron cargar las recepciones.")).toBeInTheDocument();
  });
});
