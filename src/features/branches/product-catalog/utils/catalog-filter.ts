export function isTestRow(value: string | null | undefined): boolean {
  return /^it[\s-]/i.test((value ?? "").trim());
}

export function visibleCatalogEntries<T extends { name: string }>(entries: T[]): T[] {
  return entries.filter((entry) => !isTestRow(entry.name));
}

export function visibleCatalogProducts<
  T extends { barcode: string; name: string; status?: string | null },
>(products: T[]): T[] {
  return products.filter(
    (product) =>
      (product.status ?? "ACTIVE") === "ACTIVE" &&
      !isTestRow(product.barcode) &&
      !isTestRow(product.name),
  );
}
