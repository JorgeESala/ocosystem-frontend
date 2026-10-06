import { describe, it, expect } from "vitest";
import { isTestRow, visibleCatalogEntries } from "../utils/catalog-filter";

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
});
