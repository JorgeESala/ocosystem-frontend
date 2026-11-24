import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { ReferenceProductModal } from "../components/ReferenceProductModal";

const mocks = vi.hoisted(() => ({
  update: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  refetch: vi.fn(),
  rows: [
    {
      branchId: 1,
      branchName: "Centro",
      productBarcode: "REF",
      productName: "Pollo entero",
      unitName: "Kilogramo",
      pricePerKg: 50,
      priceAsOf: "2026-06-07",
    },
    {
      branchId: 2,
      branchName: "Norte",
      productBarcode: "REF",
      productName: "Pollo entero",
      unitName: "Kilogramo",
      pricePerKg: null,
      priceAsOf: null,
    },
  ],
  products: [
    {
      barcode: "REF",
      name: "Pollo entero",
      categoryName: "Pollo",
      unitName: "Kilogramo",
      status: "ACTIVE",
      sku: "REF",
      isCanonical: true,
    },
    {
      barcode: "REF2",
      name: "Pollo entero premium",
      categoryName: "Pollo",
      unitName: "Kilogramo",
      status: "ACTIVE",
      sku: "REF2",
      isCanonical: true,
    },
    {
      barcode: "PIEZA",
      name: "Pollo en pieza",
      categoryName: "Pollo",
      unitName: "Pieza",
      status: "ACTIVE",
      sku: "PIEZA",
      isCanonical: true,
    },
    {
      barcode: "HUEVO",
      name: "Huevo blanco",
      categoryName: "Huevo",
      unitName: "Kilogramo",
      status: "ACTIVE",
      sku: "HUEVO",
      isCanonical: true,
    },
    {
      barcode: "INACTIVO",
      name: "Pollo inactivo",
      categoryName: "Pollo",
      unitName: "Kilogramo",
      status: "INACTIVE",
      sku: "INACTIVO",
      isCanonical: true,
    },
    {
      barcode: "VAR",
      name: "Pollo variante",
      categoryName: "Pollo",
      unitName: "Kilogramo",
      status: "ACTIVE",
      sku: "REF2",
      isCanonical: false,
    },
  ],
}));

vi.mock("../api/expectedSales.queries", () => ({
  useReferenceProducts: () => ({
    data: mocks.rows,
    isLoading: false,
    isError: false,
    refetch: mocks.refetch,
  }),
  useUpdateReferenceProduct: () => ({
    mutateAsync: mocks.update,
    isPending: false,
    error: null,
  }),
  useDeleteReferenceProduct: () => ({
    mutateAsync: mocks.remove,
    isPending: false,
    error: null,
  }),
}));

vi.mock(
  "@/features/branches/product-catalog/api/product-catalog.queries",
  () => ({
    useProductCatalog: () => ({
      data: mocks.products,
      isLoading: false,
      isError: false,
    }),
  }),
);

describe("ReferenceProductModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue(undefined);
  });

  it("lists the branches with their configured product and price", () => {
    render(
      <ReferenceProductModal asOf={new Date(2026, 5, 7)} onClose={vi.fn()} />,
    );

    expect(
      screen.getByText("Producto de referencia por sucursal"),
    ).toBeTruthy();
    expect(screen.getByText("Centro")).toBeTruthy();
    expect(screen.getByText("Norte")).toBeTruthy();
    expect(screen.getByText(/\$50\.00 \/ kg/)).toBeTruthy();
    expect(screen.getByText(/Precio del/)).toBeTruthy();
    expect(screen.getByText("Sin precio de venta registrado")).toBeTruthy();
  });

  it("only offers chicken products sold by kilo", () => {
    render(
      <ReferenceProductModal asOf={new Date(2026, 5, 7)} onClose={vi.fn()} />,
    );

    const centro = screen.getByLabelText("Producto de referencia de Centro");
    expect(within(centro).getByText("Pollo entero · REF")).toBeTruthy();
    expect(
      within(centro).getByText("Pollo entero premium · REF2"),
    ).toBeTruthy();
    expect(within(centro).queryByText(/Pollo en pieza/)).toBeNull();
    expect(within(centro).queryByText(/Huevo blanco/)).toBeNull();
    expect(within(centro).queryByText(/Pollo inactivo/)).toBeNull();
    expect(within(centro).queryByText(/Pollo variante/)).toBeNull();
  });

  it("saves the selected product for a branch", async () => {
    render(
      <ReferenceProductModal asOf={new Date(2026, 5, 7)} onClose={vi.fn()} />,
    );

    fireEvent.change(
      screen.getByLabelText("Producto de referencia de Centro"),
      {
        target: { value: "REF2" },
      },
    );

    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({
        branchId: 1,
        productBarcode: "REF2",
      }),
    );
  });

  it("clears the product when the empty option is selected", async () => {
    render(
      <ReferenceProductModal asOf={new Date(2026, 5, 7)} onClose={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText("Producto de referencia de Norte"), {
      target: { value: "" },
    });

    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith(2));
  });

  it("shows an error when the change cannot be saved", async () => {
    mocks.update.mockRejectedValueOnce(new Error("boom"));
    render(
      <ReferenceProductModal asOf={new Date(2026, 5, 7)} onClose={vi.fn()} />,
    );

    fireEvent.change(
      screen.getByLabelText("Producto de referencia de Centro"),
      {
        target: { value: "REF2" },
      },
    );

    await waitFor(() =>
      expect(
        screen.getByText("No se pudo guardar el producto de referencia."),
      ).toBeTruthy(),
    );
  });
});
