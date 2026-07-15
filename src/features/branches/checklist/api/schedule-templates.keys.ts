export const scheduleTemplatesKeys = {
  all: ["branch-schedule-templates"] as const,
  list: (branchId?: number) =>
    [...scheduleTemplatesKeys.all, "list", branchId ?? "all"] as const,
};
