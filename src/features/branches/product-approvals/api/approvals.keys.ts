export const approvalKeys = {
  all: ["product-approvals"] as const,
  pending: () => [...approvalKeys.all, "pending"] as const,
};
