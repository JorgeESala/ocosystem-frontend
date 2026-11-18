import type { ExpenseCategoryDTO } from "../types";

export interface ExpenseCategoryOption {
  id: number;
  name: string;
}

export interface ExpenseCategoryOptionGroup {
  label: string;
  options: ExpenseCategoryOption[];
}

const activeCategories = (categories: ExpenseCategoryDTO[]) =>
  categories.filter((category) => category.active !== false);

const parentIdsWithChildren = (categories: ExpenseCategoryDTO[]) =>
  new Set(
    categories
      .map((category) => category.parentId)
      .filter((parentId): parentId is number => parentId != null),
  );

export const isSelectableExpenseCategory = (
  category: ExpenseCategoryDTO,
  parentIds: Set<number>,
) =>
  category.active !== false &&
  category.selectable !== false &&
  !parentIds.has(category.id);

export const selectableExpenseCategories = (
  categories: ExpenseCategoryDTO[],
): ExpenseCategoryDTO[] => {
  const parentIds = parentIdsWithChildren(categories);
  return activeCategories(categories).filter((category) =>
    isSelectableExpenseCategory(category, parentIds),
  );
};

export const buildExpenseCategoryGroups = (
  categories: ExpenseCategoryDTO[],
): ExpenseCategoryOptionGroup[] => {
  const active = activeCategories(categories);
  const byId = new Map(active.map((category) => [category.id, category]));
  const selectable = selectableExpenseCategories(categories);
  const groups = new Map<
    string,
    { label: string; sortOrder: number; options: ExpenseCategoryOption[] }
  >();

  for (const category of selectable) {
    const parent = category.parentId ? byId.get(category.parentId) : undefined;
    const label = parent?.name ?? "Otros";
    const group = groups.get(label) ?? {
      label,
      sortOrder: parent?.sortOrder ?? category.sortOrder ?? 0,
      options: [],
    };
    group.options.push({ id: category.id, name: category.name });
    groups.set(label, group);
  }

  return [...groups.values()]
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.label.localeCompare(right.label, "es"),
    )
    .map(({ label, options }) => ({ label, options }));
};

export const categoryLabel = (
  category: ExpenseCategoryDTO | undefined,
  categories: ExpenseCategoryDTO[],
) => {
  if (!category) return "";
  const parent = category.parentId
    ? categories.find((item) => item.id === category.parentId)
    : undefined;
  return parent ? `${parent.name} / ${category.name}` : category.name;
};
