export const solicitorKeys = {
  all: ["credit-solicitors"] as const,

  lists: (business: string) =>
    [...solicitorKeys.all, business, "list"] as const,

  listByEntity: (business: string, params?: Record<string, any>) =>
    [...solicitorKeys.lists(business), "by-entity", params] as const,
};
