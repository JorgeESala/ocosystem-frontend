export const reportKeys = {
  all: ["reports"] as const,
  upload: () => [...reportKeys.all, "upload"] as const,
};
