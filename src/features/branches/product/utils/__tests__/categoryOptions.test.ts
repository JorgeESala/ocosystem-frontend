import { describe, it, expect } from "vitest";
import { categoryOptions, isEggQuantityCategory } from "../categoryOptions";

describe("categoryOptions", () => {
  it("orders roots first with indented children and filters test rows", () => {
    const options = categoryOptions([
      { id: 8, name: "Casillero de huevo", parentId: 9 },
      { id: 2, name: "Abarrotes", parentId: null },
      { id: 7, name: "Piezas de huevo", parentId: 9 },
      { id: 11, name: "IT Categoria", parentId: null },
      { id: 9, name: "Huevo", parentId: null },
    ]);

    expect(options.map((category) => category.id)).toEqual([2, 9, 8, 7]);
    expect(options[2].name).toBe("└ Casillero de huevo");
    expect(options[3].name).toBe("└ Piezas de huevo");
    expect(options.some((category) => category.id === 11)).toBe(false);
  });

  it("treats categories without parentId as roots", () => {
    const options = categoryOptions([{ id: 1, name: "Pollo" }]);

    expect(options).toEqual([{ id: 1, name: "Pollo" }]);
  });

  it("nests deeper descendants under their ancestors", () => {
    const options = categoryOptions([
      { id: 1, name: "Raíz", parentId: null },
      { id: 3, name: "Nieto", parentId: 2 },
      { id: 2, name: "Hijo", parentId: 1 },
    ]);

    expect(options.map((category) => category.id)).toEqual([1, 2, 3]);
  });
});

describe("isEggQuantityCategory", () => {
  const byId = new Map<number, { name: string; parentId?: number | null }>(
    [
      { id: 9, name: "Huevo", parentId: null },
      { id: 7, name: "Piezas de huevo", parentId: 9 },
      { id: 8, name: "Casillero de huevo", parentId: 9 },
      { id: 2, name: "Abarrotes", parentId: null },
    ].map((category) => [category.id, category]),
  );

  it("walks the category chain up to the egg quantity branches", () => {
    expect(isEggQuantityCategory(7, byId)).toBe(true);
    expect(isEggQuantityCategory(8, byId)).toBe(true);
    expect(isEggQuantityCategory(9, byId)).toBe(false);
    expect(isEggQuantityCategory(2, byId)).toBe(false);
    expect(isEggQuantityCategory(null, byId)).toBe(false);
  });

  it("handles unknown or cyclic categories safely", () => {
    expect(isEggQuantityCategory(999, byId)).toBe(false);
    const cyclic = new Map<number, { name: string; parentId?: number | null }>([
      [1, { name: "A", parentId: 2 }],
      [2, { name: "B", parentId: 1 }],
    ]);
    expect(isEggQuantityCategory(1, cyclic)).toBe(false);
  });
});
