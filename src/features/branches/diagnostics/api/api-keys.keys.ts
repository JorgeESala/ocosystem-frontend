export const apiKeyKeys = {
  all: ["branch-app-api-keys"] as const,
  list: () => [...apiKeyKeys.all, "list"] as const,
};
