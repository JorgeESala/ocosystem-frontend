export const orderPredictionKeys = {
  all: ["order-prediction"] as const,
  schedules: () => [...orderPredictionKeys.all, "schedules"] as const,
  predictions: () => [...orderPredictionKeys.all, "predictions"] as const,
};
