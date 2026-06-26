export const paymentKeys = {
  all: ["payments"] as const,

  lists: () => [...paymentKeys.all, "list"] as const,

  recent: (limit: number) => [...paymentKeys.lists(), "recent", limit] as const,
};
