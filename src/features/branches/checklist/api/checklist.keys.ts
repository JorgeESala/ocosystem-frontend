export const checklistKeys = {
  all: ["branch-checklist"] as const,
  daily: (date: string, branchIds: number[]) =>
    [
      ...checklistKeys.all,
      "daily",
      date,
      [...branchIds].sort((a, b) => a - b).join(","),
    ] as const,
  performance: (from: string, to: string, branchIds: number[], includeDays: boolean) =>
    [
      ...checklistKeys.all,
      "performance",
      from,
      to,
      [...branchIds].sort((a, b) => a - b).join(","),
      includeDays,
    ] as const,
  currentWeek: (branchIds: number[]) =>
    [
      ...checklistKeys.all,
      "currentWeek",
      [...branchIds].sort((a, b) => a - b).join(","),
    ] as const,
};
