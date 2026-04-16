export const branchKeys = {
  all: ["branches"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  detail: (id: number) => [...branchKeys.all, "detail", id] as const,
};
