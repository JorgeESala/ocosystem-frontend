import { describe, expect, it } from "vitest";
import {
  buildExpenseCategoryGroups,
  categoryLabel,
  selectableExpenseCategories,
} from "../utils/expense-category-options";
import type { ExpenseCategoryDTO } from "../types";

const categories: ExpenseCategoryDTO[] = [
  {
    id: 1,
    name: "Costo de ventas",
    parentId: null,
    sortOrder: 10,
    active: true,
    selectable: false,
  },
  {
    id: 2,
    name: "Gas LP",
    parentId: 1,
    parentName: "Costo de ventas",
    sortOrder: 30,
    active: true,
    selectable: true,
  },
  {
    id: 3,
    name: "Servicios",
    parentId: null,
    sortOrder: 20,
    active: true,
    selectable: false,
  },
  {
    id: 4,
    name: "Luz",
    parentId: 3,
    parentName: "Servicios",
    sortOrder: 20,
    active: true,
    selectable: true,
  },
  {
    id: 5,
    name: "Remodelación",
    parentId: 3,
    parentName: "Servicios",
    sortOrder: 90,
    active: true,
    selectable: true,
    visibleInBranchApp: false,
  },
  {
    id: 6,
    name: "Histórico",
    parentId: 3,
    parentName: "Servicios",
    sortOrder: 99,
    active: false,
    selectable: false,
  },
];

describe("expense category options", () => {
  it("keeps only active leaves", () => {
    const result = selectableExpenseCategories(categories);

    expect(result.map((category) => category.id)).toEqual([2, 4, 5]);
  });

  it("groups leaves under their parent in tree order", () => {
    const groups = buildExpenseCategoryGroups(categories);

    expect(groups).toEqual([
      {
        label: "Costo de ventas",
        options: [{ id: 2, name: "Gas LP" }],
      },
      {
        label: "Servicios",
        options: [
          { id: 4, name: "Luz" },
          { id: 5, name: "Remodelación" },
        ],
      },
    ]);
  });

  it("builds the full label for a leaf", () => {
    expect(categoryLabel(categories[1], categories)).toBe(
      "Costo de ventas / Gas LP",
    );
  });
});
