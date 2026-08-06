export const notificationKeys = {
  all: ["notifications"] as const,
  summary: (branchIds: number[]) =>
    [...notificationKeys.all, "summary", [...branchIds].sort((a, b) => a - b)] as const,
  list: (branchIds: number[]) =>
    [...notificationKeys.all, "list", [...branchIds].sort((a, b) => a - b)] as const,
  detail: (id: number) => [...notificationKeys.all, "detail", id] as const,
  history: (branchIds: number[]) =>
    [...notificationKeys.all, "history", [...branchIds].sort((a, b) => a - b)] as const,
};
