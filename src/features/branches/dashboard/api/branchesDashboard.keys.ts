export const branchesDashboardKeys = {
  all: ["branches-dashboard"] as const,
  summary: (branchIds: number[], start: string, end: string) =>
    [...branchesDashboardKeys.all, { branchIds, start, end }] as const,
};
