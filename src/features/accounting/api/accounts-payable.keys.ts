export const accountsPayableKeys = {
  all: ["accounts-payable"] as const,

  lists: (business: string) =>
    [...accountsPayableKeys.all, business, "list"] as const,

  open: (business: string, params: Record<string, any>) =>
    [...accountsPayableKeys.lists(business), "open", params] as const,
};
