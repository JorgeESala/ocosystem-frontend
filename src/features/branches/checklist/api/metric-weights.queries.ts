import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { metricWeightsApi } from "./metric-weights.api";
import { metricWeightsKeys } from "./metric-weights.keys";
import type { MetricWeights } from "../types/metric-weights.types";

export const useMetricWeights = () =>
  useQuery({
    queryKey: metricWeightsKeys.all,
    queryFn: metricWeightsApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

export const useUpdateMetricWeights = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weights: MetricWeights) => metricWeightsApi.update(weights),
    onSuccess: (data) => {
      qc.setQueryData(metricWeightsKeys.all, data);
      qc.invalidateQueries({ queryKey: ["branch-checklist"] });
    },
  });
};
