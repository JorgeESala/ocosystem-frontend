export const accountsPayableMovementKeys = {
  all: ["accounts-payable-movements"] as const,

  lists: (business?: string) =>
    [...accountsPayableMovementKeys.all, "list", business ?? "public"] as const,

  listByAccount: (business: string | undefined, accountId: number) =>
    [...accountsPayableMovementKeys.lists(business), accountId] as const,
};
