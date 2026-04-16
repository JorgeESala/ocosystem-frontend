export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  details: (id: number) => [...clientKeys.all, "detail", id] as const,
};
