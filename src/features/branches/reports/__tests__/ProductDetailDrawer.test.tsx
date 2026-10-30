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
  receivedQuantity: 12,
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

  it("muestra la fila de totales al final de la tabla por sucursal", () => {
    render(<ProductDetailDrawer {...baseProps} />);

    const totalRow = screen.getByText("Total").closest("tr");
    const cells = Array.from(totalRow?.querySelectorAll("td") ?? []).map(
      (cell) => cell.textContent,
    );
    expect(cells).toEqual(["Total", "12", "12", "$120.00", "—"]);
  }, 15000);

  it("incluye sucursales que recibieron producto aunque no vendieran", () => {
    detail.current = {
      ...single,
      branches: [
        branch,
        {
          branchId: 2,
          branchName: "Norte",
          quantity: 0,
          sales: 0,
          daysWithSales: 0,
          daily: [],
          receivedQuantity: 5,
        },
      ],
    };
    render(<ProductDetailDrawer {...baseProps} />);

    const row = screen.getByRole("cell", { name: "Norte" }).closest("tr");
    const cells = Array.from(row?.querySelectorAll("td") ?? []).map(
      (cell) => cell.textContent,
    );
    expect(cells).toEqual(["Norte", "0", "5", "$0.00", "0"]);
  }, 15000);

  it("muestra — cuando la sucursal no tiene recepciones", () => {
    detail.current = {
      ...single,
      branches: [{ ...branch, receivedQuantity: 0 }],
    };
    render(<ProductDetailDrawer {...baseProps} />);

    const row = screen.getByRole("cell", { name: "Centro" }).closest("tr");
    const cells = Array.from(row?.querySelectorAll("td") ?? []).map(
      (cell) => cell.textContent,
    );
    expect(cells).toEqual(["Centro", "12", "—", "$120.00", "1"]);
  }, 15000);
});
