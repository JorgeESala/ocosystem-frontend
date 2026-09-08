export const accountingEntityKeys = {
  all: ["accounting-entities"] as const,

  lists: (business?: string) =>
    [...accountingEntityKeys.all, "list", business ?? "public"] as const,

  byType: (business: string | undefined, entityType?: string) =>
    [...accountingEntityKeys.lists(business), entityType] as const,
};
