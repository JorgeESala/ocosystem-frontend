import { http } from "@/shared/api/http";

export interface ParameterSchema {
  key: string;
  type: string;
  min: number;
  max: number;
  defaultValue: number;
  description: string;
}

export interface MetricFormulaConfig {
  metricId: string;
  parameters: Record<string, number>;
  schema: ParameterSchema[];
}

export const metricFormulaConfigApi = {
  getAll: async (): Promise<MetricFormulaConfig[]> => {
    const { data } = await http.get<MetricFormulaConfig[]>(
      "/api/v1/branches/metric-formula-config",
    );
    return data;
  },

  update: async (
    metricId: string,
    parameters: Record<string, number>,
  ): Promise<MetricFormulaConfig> => {
    const { data } = await http.put<MetricFormulaConfig>(
      `/api/v1/branches/metric-formula-config/${metricId}`,
      parameters,
    );
    return data;
  },
};
