export const branchSupplierKeys = {
  all: ["branch-suppliers"] as const,
  lists: () => [...branchSupplierKeys.all, "list"] as const,
};
