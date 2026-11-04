export const eggPriceReferenceKeys = {
  all: ["egg-price-reference"] as const,
  current: (slug: string, date: string) =>
    [...eggPriceReferenceKeys.all, "current", slug, date] as const,
  history: (slug: string) =>
    [...eggPriceReferenceKeys.all, "history", slug] as const,
};
