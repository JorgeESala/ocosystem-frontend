export function isTestRow(value: string | null | undefined): boolean {
  return /^it[\s-]/i.test((value ?? "").trim());
}

export function visibleCatalogEntries<T extends { name: string }>(entries: T[]): T[] {
  return entries.filter((entry) => !isTestRow(entry.name));
}
