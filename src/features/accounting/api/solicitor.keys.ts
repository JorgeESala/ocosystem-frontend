export const solicitorKeys = {
  all: (business: string) => ["credit-solicitors", business] as const,

  lists: (business: string) =>
    [...solicitorKeys.all(business), "list"] as const,

  listByEntity: (business: string, accountingEntityId: number) =>
    [...solicitorKeys.lists(business), accountingEntityId] as const,
};
