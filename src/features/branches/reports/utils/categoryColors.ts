export const CATEGORY_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
];

export const colorForCategory = (categoryId: number) =>
  CATEGORY_COLORS[Math.abs(categoryId) % CATEGORY_COLORS.length];
