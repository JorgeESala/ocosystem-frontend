import { describe, it, expect } from "vitest";
import {
  isTestRow,
  visibleCatalogEntries,
  visibleCatalogProducts,
} from "../utils/catalog-filter";

describe("catalog-filter", () => {
  it("detects test rows by IT prefix", () => {
    expect(isTestRow("IT Pieza Recepcion")).toBe(true);
    expect(isTestRow("IT-RC-1")).toBe(true);
    expect(isTestRow("Frijol negro")).toBe(false);
    expect(isTestRow(null)).toBe(false);
  });

  it("hides test rows from manager dropdowns", () => {
    const entries = [{ name: "Kilo" }, { name: "IT Kilo Recepcion" }];

    expect(visibleCatalogEntries(entries)).toEqual([{ name: "Kilo" }]);
  });

  it("keeps only active, non-test products for resolve candidates", () => {
    const products = [
      { barcode: "A1", name: "Frijol", status: "ACTIVE" },
      { barcode: "P1", name: "Pendiente", status: "PENDING" },
      { barcode: "IT-9", name: "IT Prueba", status: "ACTIVE" },
      { barcode: "L1", name: "Libre", status: null },
    ];

    expect(visibleCatalogProducts(products)).toEqual([
      { barcode: "A1", name: "Frijol", status: "ACTIVE" },
      { barcode: "L1", name: "Libre", status: null },
    ]);
  });
});
