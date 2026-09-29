import { describe, expect, it } from "vitest";
import {
  filterTopProducts,
  isChickenCategory,
  isEggCategory,
} from "../utils/topCategoryFilters";

describe("topCategoryFilters", () => {
  it("detects chicken by id or name", () => {
    expect(isChickenCategory(1, "Abarrotes")).toBe(true);
    expect(isChickenCategory(9, "Pollo")).toBe(true);
    expect(isChickenCategory(9, "Abarrotes")).toBe(false);
  });

  it("detects egg by id or name prefix", () => {
    expect(isEggCategory(8, "Abarrotes")).toBe(true);
    expect(isEggCategory(3, "Huevo casillero")).toBe(true);
    expect(isEggCategory(3, "Abarrotes")).toBe(false);
  });

  it("filters chicken and egg independently", () => {
    const products = [
      { productBarcode: "P", categoryId: 1, categoryName: "Pollo" },
      { productBarcode: "H", categoryId: 8, categoryName: "Huevo" },
      { productBarcode: "A", categoryId: 4, categoryName: "Abarrotes" },
    ];

    expect(
      filterTopProducts(products, true, false).map((p) => p.productBarcode),
    ).toEqual(["H", "A"]);
    expect(
      filterTopProducts(products, false, true).map((p) => p.productBarcode),
    ).toEqual(["P", "A"]);
    expect(
      filterTopProducts(products, true, true).map((p) => p.productBarcode),
    ).toEqual(["A"]);
    expect(filterTopProducts(products, false, false)).toHaveLength(3);
  });
});
