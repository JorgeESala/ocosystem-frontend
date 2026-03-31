export const accountsPayableMovementKeys = {
  all: ["accounts-payable-movements"] as const,

  lists: () => [...accountsPayableMovementKeys.all, "list"] as const,

  listByAccount: (accountId: number) =>
    [...accountsPayableMovementKeys.lists(), accountId] as const,
};
