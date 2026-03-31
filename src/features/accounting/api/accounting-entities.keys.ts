export const accountingEntityKeys = {
  all: ["accounting-entities"] as const,

  lists: () => [...accountingEntityKeys.all, "list"] as const,

  byType: (entityType?: string) =>
    [...accountingEntityKeys.lists(), entityType] as const,
};
