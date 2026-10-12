import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProductBranchMatrix } from "../components/ProductBranchMatrix";
import type { ProductAnalyticsRowDTO } from "../api/productAnalytics.api";

const row = (
  overrides: Partial<ProductAnalyticsRowDTO> = {},
): ProductAnalyticsRowDTO => ({
  productBarcode: "IT-POLLO",
  productName: "Pollo",
  categoryName: "Abarrotes",
  unitName: "kg",
  quantity: 10,
  sales: 1000,
  daysWithSales: 5,
  avgDailyQuantity: 2,
  previousQuantity: 8,
  previousSales: 800,
  salesGrowth: 25,
  cancelledQuantity: 0,
  cancelledSubtotal: 0,
  abcClass: "C",
  receivedQuantity: null,
  branchBreakdown: [
    { branchId: 1, branchName: "Centro", quantity: 7, sales: 700 },
    { branchId: 2, branchName: "Norte", quantity: 3, sales: 300 },
  ],
  ...overrides,
});

const branches = [
  { id: 1, name: "Centro" },
  { id: 2, name: "Norte" },
];

describe("ProductBranchMatrix", () => {
  it("renders products and branch columns", () => {
    render(
      <ProductBranchMatrix
        rows={[row()]}
        branches={branches}
        metric="sales"
        onMetricChange={vi.fn()}
        onSelectProduct={vi.fn()}
      />,
    );

    expect(screen.getByText("Pollo")).toBeTruthy();
    expect(screen.getByText("Centro")).toBeTruthy();
    expect(screen.getByText("Norte")).toBeTruthy();
  });

  it("notifies metric changes", () => {
    const onMetricChange = vi.fn();
    render(
      <ProductBranchMatrix
        rows={[row()]}
        branches={branches}
        metric="sales"
        onMetricChange={onMetricChange}
        onSelectProduct={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Unidades"));

    expect(onMetricChange).toHaveBeenCalledWith("quantity");
  });

  it("selects a product when its row is clicked", () => {
    const onSelectProduct = vi.fn();
    render(
      <ProductBranchMatrix
        rows={[row()]}
        branches={branches}
        metric="sales"
        onMetricChange={vi.fn()}
        onSelectProduct={onSelectProduct}
      />,
    );

    fireEvent.click(screen.getByText("Pollo"));

    expect(onSelectProduct).toHaveBeenCalledWith("IT-POLLO", "Pollo");
  });

  it("shows an empty state without products", () => {
    render(
      <ProductBranchMatrix
        rows={[]}
        branches={branches}
        metric="sales"
        onMetricChange={vi.fn()}
        onSelectProduct={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Sin ventas de productos en el rango/i),
    ).toBeTruthy();
  });
});
