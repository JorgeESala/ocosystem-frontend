export const localityKeys = {
  all: ["localities"] as const,
  list: () => [...localityKeys.all, "list"] as const,
};
