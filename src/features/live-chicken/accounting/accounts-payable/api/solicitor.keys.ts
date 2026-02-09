export const solicitorKeys = {
  all: ["credit-solicitors"] as const,

  lists: () => [...solicitorKeys.all, "list"] as const,

  listByEntity: (accountingEntityId: number) =>
    [...solicitorKeys.lists(), accountingEntityId] as const,
};
