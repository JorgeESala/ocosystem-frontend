export const accountsPayableKeys = {
  all: ["accounts-payable"] as const,

  lists: () => [...accountsPayableKeys.all, "list"] as const,

  open: (params: Record<string, any>) =>
    [...accountsPayableKeys.all, "open", params] as const,
};
