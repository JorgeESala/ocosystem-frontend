import { describe, it, expect } from "vitest";
import { lineDisplayName, normalizedLineCost, unitSingular } from "../utils/receipt-cost";
import type { ReceiptCostDTO, ReceiptLineDTO } from "../types";

const line = (overrides: Partial<ReceiptLineDTO> = {}): ReceiptLineDTO => ({
  id: 1,
  lineNumber: 1,
  productBarcode: "A1",
  productName: "Frijol negro",
  sourceBarcode: "A1",
  observedName: null,
  quantity: 5,
  unitName: "Kilo",
  unitId: 1,
  toProductUnitFactor: 1,
  latestCost: null,
  costHistory: [],
  ...overrides,
});

const cost = (overrides: Partial<ReceiptCostDTO> = {}): ReceiptCostDTO => ({
  id: 9,
  unitCost: 850,
  costUnit: "Bulto",
  toLineUnitFactor: 50,
  enteredBy: "gerente@ocosur.mx",
  enteredAt: "2026-09-15T10:00:00Z",
  ...overrides,
});

describe("unitSingular", () => {
  it("singularizes plural units for display", () => {
    expect(unitSingular("piezas")).toBe("pieza");
    expect(unitSingular("kilos")).toBe("kilo");
    expect(unitSingular("bultos")).toBe("bulto");
  });

  it("leaves singular units untouched", () => {
    expect(unitSingular("Kilo")).toBe("Kilo");
    expect(unitSingular("paquete")).toBe("paquete");
    expect(unitSingular("")).toBe("");
  });
});

describe("receipt-cost", () => {
  it("prefers the catalog name, then the observed name, then the barcode", () => {
    expect(lineDisplayName(line())).toBe("Frijol negro");
    expect(lineDisplayName(line({ productName: null }))).toBe("A1");
    expect(
      lineDisplayName(
        line({ productName: null, productBarcode: null, observedName: "Azúcar" }),
      ),
    ).toBe("Azúcar");
  });

  it("normalizes a package cost to the received unit", () => {
    expect(normalizedLineCost(line(), cost())).toEqual({ amount: 17, unit: "Kilo" });
  });

  it("keeps the cost when units already match", () => {
    expect(
      normalizedLineCost(line(), cost({ unitCost: 42.5, costUnit: "Kilo", toLineUnitFactor: null })),
    ).toEqual({ amount: 42.5, unit: "Kilo" });
  });

  it("returns null when the cost cannot be normalized", () => {
    expect(
      normalizedLineCost(line(), cost({ costUnit: "Bulto", toLineUnitFactor: null })),
    ).toBeNull();
  });
});
