export const notificationKeys = {
  all: ["notifications"] as const,
  summary: (branchIds: number[]) =>
    [...notificationKeys.all, "summary", branchIds.sort()] as const,
  list: (branchIds: number[]) =>
    [...notificationKeys.all, "list", branchIds.sort()] as const,
};
