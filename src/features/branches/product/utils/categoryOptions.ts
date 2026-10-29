import { isTestRow } from "@/features/branches/product-catalog/utils/catalog-filter";

export interface CatalogCategoryNode {
  name: string;
  parentId?: number | null;
}

export const EGG_QUANTITY_CATEGORY_NAMES = [
  "piezas de huevo",
  "casillero de huevo",
];

export function isEggQuantityCategory(
  categoryId: number | null,
  categoriesById: Map<number, CatalogCategoryNode>,
): boolean {
  let currentId = categoryId;
  const visited = new Set<number>();
  while (currentId != null && !visited.has(currentId)) {
    visited.add(currentId);
    const category = categoriesById.get(currentId);
    if (!category) return false;
    if (
      EGG_QUANTITY_CATEGORY_NAMES.includes(category.name.trim().toLowerCase())
    ) {
      return true;
    }
    currentId = category.parentId ?? null;
  }
  return false;
}

export interface CategoryOptionLike {
  id: number;
  name: string;
  parentId?: number | null;
}

export function categoryOptions<T extends CategoryOptionLike>(
  categories: T[],
): CategoryOptionLike[] {
  const visible = categories.filter((category) => !isTestRow(category.name));
  const childrenByParent = new Map<number, T[]>();
  const roots: T[] = [];
  for (const category of visible) {
    if (category.parentId == null) {
      roots.push(category);
    } else {
      const siblings = childrenByParent.get(category.parentId) ?? [];
      siblings.push(category);
      childrenByParent.set(category.parentId, siblings);
    }
  }
  const byName = (a: T, b: T) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" });
  roots.sort(byName);
  childrenByParent.forEach((children) => children.sort(byName));

  const ordered: CategoryOptionLike[] = [];
  const walk = (list: T[]) => {
    for (const category of list) {
      ordered.push(category);
      const children = childrenByParent.get(category.id);
      if (children) {
        walk(children);
      }
    }
  };
  walk(roots);
  return ordered.map((category) =>
    category.parentId == null
      ? category
      : { ...category, name: `└ ${category.name}` },
  );
}
