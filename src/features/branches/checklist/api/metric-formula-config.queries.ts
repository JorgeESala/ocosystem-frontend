import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { metricFormulaConfigApi } from "./metric-formula-config.api";
import { metricFormulaConfigKeys } from "./metric-formula-config.keys";
import type { MetricFormulaConfig } from "./metric-formula-config.api";

export const useMetricFormulaConfig = () =>
  useQuery({
    queryKey: metricFormulaConfigKeys.all,
    queryFn: metricFormulaConfigApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

export const useUpdateMetricFormulaConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      metricId,
      parameters,
    }: {
      metricId: string;
      parameters: Record<string, number>;
    }) => metricFormulaConfigApi.update(metricId, parameters),
    onSuccess: (data: MetricFormulaConfig) => {
      queryClient.setQueryData(
        metricFormulaConfigKeys.all,
        (old: MetricFormulaConfig[] | undefined) => {
          if (!old) return [data];
          return old.map((config) =>
            config.metricId === data.metricId ? data : config,
          );
        },
      );
    },
  });
};
