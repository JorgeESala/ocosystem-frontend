export const checklistKeys = {
  all: ["branch-checklist"] as const,
  daily: (date: string, branchIds: number[]) =>
    [
      ...checklistKeys.all,
      "daily",
      date,
      [...branchIds].sort((a, b) => a - b).join(","),
    ] as const,
};
