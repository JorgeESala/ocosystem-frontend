import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProductCatalogCard } from "../components/ProductCatalogCard";
import type { ProductAnalyticsRowDTO } from "../api/productAnalytics.api";

const row = (
  barcode: string,
  name: string,
  overrides: Partial<ProductAnalyticsRowDTO> = {},
): ProductAnalyticsRowDTO => ({
  productBarcode: barcode,
  productName: name,
  categoryName: "Abarrotes",
  unitName: "kg",
  quantity: 4,
  sales: 200,
  daysWithSales: 2,
  avgDailyQuantity: 2,
  previousQuantity: 0,
  previousSales: 0,
  salesGrowth: null,
  cancelledQuantity: 0,
  cancelledSubtotal: 0,
  branchBreakdown: [],
  abcClass: "C",
  receivedQuantity: null,
  ...overrides,
});

const baseProps = {
  rows: [row("IT-A", "Producto A")],
  metric: "sales" as const,
  searchValue: "",
  onSearchChange: vi.fn(),
  onSelectProduct: vi.fn(),
};

describe("ProductCatalogCard", () => {
  it("shows the range and disables previous on the first page", () => {
    const onPageChange = vi.fn();
    render(
      <ProductCatalogCard
        {...baseProps}
        total={25}
        page={0}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText("Mostrando 1–1 de 25")).toBeTruthy();
    expect(screen.getByText("Anterior")).toBeDisabled();
    expect(screen.getByText("Siguiente")).toBeEnabled();
  });

  it("disables next on the last page and goes back", () => {
    const onPageChange = vi.fn();
    render(
      <ProductCatalogCard
        {...baseProps}
        total={21}
        page={2}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText("Siguiente")).toBeDisabled();
    fireEvent.click(screen.getByText("Anterior"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("opens the product detail when a row is clicked", () => {
    const onSelectProduct = vi.fn();
    render(
      <ProductCatalogCard
        {...baseProps}
        onSelectProduct={onSelectProduct}
        total={1}
        page={0}
        pageSize={10}
        onPageChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Producto A"));

    expect(onSelectProduct).toHaveBeenCalledWith("IT-A", "Producto A");
  });

  it("shows the ABC class coming from the API row", () => {
    render(
      <ProductCatalogCard
        {...baseProps}
        rows={[row("IT-A", "Producto A", { abcClass: "A" })]}
        total={1}
        page={0}
        pageSize={10}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText("A")).toBeTruthy();
  });

  it("reports search input changes", () => {
    const onSearchChange = vi.fn();
    render(
      <ProductCatalogCard
        {...baseProps}
        onSearchChange={onSearchChange}
        total={1}
        page={0}
        pageSize={10}
        onPageChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Buscar en el catálogo..."), {
      target: { value: "pollo" },
    });

    expect(onSearchChange).toHaveBeenCalledWith("pollo");
  });

  it("shows received quantities and a dash when nothing was recorded", () => {
    render(
      <ProductCatalogCard
        {...baseProps}
        rows={[
          row("IT-A", "Producto A", { quantity: 4, receivedQuantity: 12.5 }),
          row("IT-B", "Producto B", { receivedQuantity: null }),
        ]}
        total={2}
        page={0}
        pageSize={10}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Recibido")).toBeTruthy();
    expect(screen.getByText("12.5")).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("shows an empty state without matches", () => {
    render(
      <ProductCatalogCard
        {...baseProps}
        rows={[]}
        total={0}
        page={0}
        pageSize={10}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/No hay productos que coincidan/i)).toBeTruthy();
  });
});
