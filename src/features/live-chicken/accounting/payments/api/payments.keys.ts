export const paymentKeys = {
  all: ["payments"] as const,

  lists: () => [...paymentKeys.all, "list"] as const,
};
