import type { ReceiptFilters } from "../types";

export const productReceiptsKeys = {
  all: ["product-receipts"] as const,
  list: (filters: ReceiptFilters) =>
    [
      ...productReceiptsKeys.all,
      "list",
      filters.branchIds.join(","),
      filters.from ?? "",
      filters.to ?? "",
      filters.pendingCostOnly,
      filters.unresolvedOnly,
    ] as const,
  detail: (id: number) => [...productReceiptsKeys.all, "detail", id] as const,
  unresolved: () => [...productReceiptsKeys.all, "unresolved"] as const,
};
