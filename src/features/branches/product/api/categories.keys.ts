export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  detail: (id: number) => [...categoryKeys.all, "detail", id] as const,
};
