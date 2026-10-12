export const productCatalogKeys = {
  all: ["product-catalog"] as const,
  list: () => [...productCatalogKeys.all, "list"] as const,
};
