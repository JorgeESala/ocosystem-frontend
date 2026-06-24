import { http } from "@/shared/api/http";
import type { MetricWeights } from "../types/metric-weights.types";

const API_BASE = "/api/v1/branches/metric-weights";

export const metricWeightsApi = {
  getAll: async (): Promise<MetricWeights> => {
    const { data } = await http.get<MetricWeights>(API_BASE);
    return data;
  },

  update: async (weights: MetricWeights): Promise<MetricWeights> => {
    const { data } = await http.put<MetricWeights>(API_BASE, weights);
    return data;
  },
};
