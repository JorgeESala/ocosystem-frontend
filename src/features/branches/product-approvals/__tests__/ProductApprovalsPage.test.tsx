import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductApprovalsPage from "../pages/ProductApprovalsPage";

const approve = vi.fn();

vi.mock("../api/approvals.queries", () => ({
  usePendingProducts: vi.fn(() => ({
    data: [
      {
        barcode: "B1",
        name: "Nuevo producto",
        categoryId: null,
        categoryName: null,
        unitId: 1,
        unitName: "Pieza",
        reportedBranchId: 2,
        reportedBranchName: "Sucursal Dos",
        createdAt: "2026-06-09T10:00:00",
        saleCount: 3,
        totalQuantity: 6,
        totalAmount: 150,
      },
    ],
    isLoading: false,
    isError: false,
  })),
  useApproveProduct: vi.fn(() => ({ mutate: approve, isPending: false })),
}));

vi.mock("../../product/api/categories.queries", () => ({
  useCategories: vi.fn(() => ({
    data: [{ id: 10, name: "Verduras" }],
  })),
}));

vi.mock("../../product/api/measurementUnits.queries", () => ({
  useMeasurementUnits: vi.fn(() => ({
    data: [{ id: 1, name: "Pieza" }],
  })),
}));

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProductApprovalsPage />
    </QueryClientProvider>,
  );
}

describe("ProductApprovalsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists pending products with branch and amount context", () => {
    renderPage();

    expect(screen.getByText("B1")).toBeInTheDocument();
    expect(screen.getAllByText("Sucursal Dos").length).toBeGreaterThan(0);
    expect(screen.getByText("$150.00")).toBeInTheDocument();
  });

  it("disables confirm until a category is chosen", () => {
    renderPage();

    const confirmButton = screen.getByRole("button", {
      name: /Confirmar/i,
    }) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
  });

  it("approves with the chosen category", async () => {
    renderPage();

    const categorySelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(categorySelect, { target: { value: "10" } });

    const confirmButton = screen.getByRole("button", {
      name: /Confirmar/i,
    }) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(false);

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(approve).toHaveBeenCalledWith({
        barcode: "B1",
        payload: { name: "Nuevo producto", categoryId: 10, unitId: 1 },
      });
    });
  });
});
