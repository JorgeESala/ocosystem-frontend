export const CHICKEN_LOSS_KEYS = {
  all: ["chicken-losses"] as const,
  list: () => [...CHICKEN_LOSS_KEYS.all, "list"] as const,
  detail: (id: number) => [...CHICKEN_LOSS_KEYS.all, "detail", id] as const,
};
