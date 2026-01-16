export const cedisKeys = {
  all: ["cedis"] as const,
  list: () => [...cedisKeys.all, "list"] as const,
};
