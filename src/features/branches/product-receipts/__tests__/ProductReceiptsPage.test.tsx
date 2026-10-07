import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductReceiptsPage from "../pages/ProductReceiptsPage";
import type { ReceiptFilters } from "../types";

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
  useResolveWithProduct: vi.fn(),
  useCatalogProducts: vi.fn(),
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

const lastCallFilters = (): ReceiptFilters =>
  useProductReceipts.mock.calls[useProductReceipts.mock.calls.length - 1][0];

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
    useProductReceipts.mockReturnValue({ data: summaries, isLoading: false, isError: false });
  });

  it("shows the last 7 days from all branches on load, without searching", () => {
    renderPage();

    expect(screen.getByText("Recepción de productos")).toBeInTheDocument();
    expect(screen.getByText("#11")).toBeInTheDocument();

    const filters = lastCallFilters();
    expect(filters.branchIds).toEqual([]);
    expect(filters.pendingCostOnly).toBe(false);
    expect(filters.unresolvedOnly).toBe(false);
    const spanDays =
      (new Date(filters.to).getTime() - new Date(filters.from).getTime()) / 86400000;
    expect(spanDays).toBe(6);
  });

  it("lists receipts with pending-cost and unresolved states", () => {
    renderPage();

    expect(screen.getByText("Sin costo (2)")).toBeInTheDocument();
    expect(screen.getByText("Sin resolver (1)")).toBeInTheDocument();
    expect(screen.getByText("Con costo")).toBeInTheDocument();
  });

  it("uses flowbite date selectors", () => {
    renderPage();

    expect(screen.getByText("Desde")).toBeInTheDocument();
    expect(screen.getByText("Hasta")).toBeInTheDocument();
  });

  it("applies the toggles when searching", () => {
    renderPage();

    fireEvent.click(screen.getByText("Sin costo"));
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(lastCallFilters().pendingCostOnly).toBe(true);
  });

  it("restores the default 7-day view when clearing", () => {
    renderPage();

    fireEvent.click(screen.getByText("Sin costo"));
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    expect(lastCallFilters().pendingCostOnly).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));

    const filters = lastCallFilters();
    expect(filters.pendingCostOnly).toBe(false);
    expect(filters.branchIds).toEqual([]);
  });

  it("opens the receipt detail when a row is clicked", () => {
    renderPage();

    fireEvent.click(screen.getByText("#11"));

    expect(screen.getByTestId("receipt-modal")).toHaveTextContent("Detalle 11");
  });

  it("shows an error state when loading fails", () => {
    useProductReceipts.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderPage();

    expect(screen.getByText("No se pudieron cargar las recepciones.")).toBeInTheDocument();
  });
});
