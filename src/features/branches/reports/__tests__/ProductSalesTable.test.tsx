import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProductSalesTable } from "../components/ProductSalesTable";
import type {
  CategorySalesDTO,
  ProductSalesDTO,
} from "../api/salesReports.api";

const product = (
  barcode: string,
  overrides: Partial<ProductSalesDTO> = {},
): ProductSalesDTO => ({
  productBarcode: barcode,
  productName: `Producto ${barcode}`,
  categoryName: "Abarrotes",
  quantitySold: 4,
  totalSales: 200,
  unitName: "kg",
  attachmentFrequency: 1,
  categoryId: 4,
  receivedQuantity: null,
  ...overrides,
});

const categories: CategorySalesDTO[] = [
  { categoryId: 4, categoryName: "Abarrotes", totalSales: 200, quantitySold: 4 },
];

describe("ProductSalesTable", () => {
  it("shows received quantities and a dash when nothing was recorded", () => {
    render(
      <ProductSalesTable
        products={[
          product("IT-A", { quantitySold: 4, receivedQuantity: 12.5 }),
          product("IT-B", { quantitySold: 2, receivedQuantity: null }),
        ]}
        categories={categories}
      />,
    );

    expect(screen.getByText("Cant. Recibida")).toBeTruthy();
    expect(screen.getAllByText("12.5")).toHaveLength(2);
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("sorts by received quantity and totals it in the footer", () => {
    render(
      <ProductSalesTable
        products={[
          product("IT-A", { quantitySold: 4, receivedQuantity: 2 }),
          product("IT-B", { quantitySold: 2, receivedQuantity: 12.5 }),
        ]}
        categories={categories}
      />,
    );

    const first = () => screen.getByText("IT-A").compareDocumentPosition(screen.getByText("IT-B"));

    fireEvent.click(screen.getByText("Cant. Recibida"));
    expect(first() & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(screen.getByText("Cant. Recibida"));
    expect(first() & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(screen.getByText("Totales Seleccionados")).toBeTruthy();
    expect(screen.getByText("14.5")).toBeTruthy();
  });
});
