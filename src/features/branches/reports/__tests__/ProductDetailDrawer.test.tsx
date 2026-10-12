import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MockResponsiveContainer } from "@/test/rechartsMock";
import { ProductDetailDrawer } from "../components/ProductDetailDrawer";
import type { ProductDetailDTO } from "../api/productAnalytics.api";

const branch = {
  branchId: 1,
  branchName: "Centro",
  quantity: 12,
  sales: 120,
  daysWithSales: 1,
  daily: [
    {
      day: "2026-06-01",
      quantity: 12,
      sales: 120,
      cancelledQuantity: 0,
      cancelledSubtotal: 0,
    },
  ],
};

const withCodes: ProductDetailDTO = {
  productBarcode: "C1",
  productName: "Casillero 12",
  categoryName: "Huevo",
  unitName: "Pieza",
  branches: [branch],
  variants: [
    {
      productBarcode: "C2",
      productName: "Casillero 12 promo",
      quantity: 2,
      sales: 20,
      isCanonical: false,
    },
    {
      productBarcode: "C1",
      productName: "Casillero 12",
      quantity: 10,
      sales: 100,
      isCanonical: true,
    },
  ],
};

const single: ProductDetailDTO = {
  ...withCodes,
  variants: [
    {
      productBarcode: "C1",
      productName: "Casillero 12",
      quantity: 12,
      sales: 120,
      isCanonical: true,
    },
  ],
};

const { detail } = vi.hoisted(() => ({
  detail: { current: null as unknown as ProductDetailDTO },
}));

vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: MockResponsiveContainer,
}));

vi.mock("../api/productAnalytics.queries", () => ({
  useProductDetail: () => ({
    data: detail.current,
    isLoading: false,
    isError: false,
  }),
}));

const baseProps = {
  open: true,
  onClose: vi.fn(),
  barcode: "C2",
  branchIds: [1],
  dates: { start: new Date(2026, 5, 1), end: new Date(2026, 5, 7) },
};

describe("ProductDetailDrawer", () => {
  beforeEach(() => {
    detail.current = withCodes;
  });

  it("lists every code of the product and marks the principal one", () => {
    render(<ProductDetailDrawer {...baseProps} />);

    expect(screen.getByText("Códigos de este producto")).toBeTruthy();
    expect(screen.getByText("C1")).toBeTruthy();
    expect(screen.getByText("C2")).toBeTruthy();
    expect(screen.getAllByText("principal")).toHaveLength(1);
  }, 15000);

  it("hides the code list when the product has a single code", () => {
    detail.current = single;
    render(<ProductDetailDrawer {...baseProps} />);

    expect(screen.queryByText("Códigos de este producto")).toBeNull();
    expect(screen.queryByText("principal")).toBeNull();
  }, 15000);
});
