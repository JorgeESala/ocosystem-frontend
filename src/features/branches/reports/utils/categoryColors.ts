export const CATEGORY_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#EC4899",
  "#14B8A6",
  "#D946EF",
  "#EAB308",
  "#64748B",
];

const UNCATEGORIZED_COLOR = "#6B7280";

export const colorForCategory = (categoryId: number) =>
  categoryId > 0
    ? CATEGORY_COLORS[categoryId % CATEGORY_COLORS.length]
    : UNCATEGORIZED_COLOR;
