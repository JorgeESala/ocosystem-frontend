import type { MetricResult, MetricSummary } from "../types/checklist.types";
import { getMetricMeta } from "../config/metricRegistry";
import { formatPercent } from "./format-score";

export const describeMetric = (
  result: MetricResult | MetricSummary,
): string => {
  const meta = getMetricMeta(result.id);
  const baseLabel = meta?.longLabel ?? "Indicador";
  if (!result.evaluable) {
    return `${baseLabel}: sin datos en el periodo`;
  }
  if (result.score == null) {
    return `${baseLabel}: sin puntaje en el periodo`;
  }
  const detail = (result as MetricResult).detail ?? (result as MetricSummary).detail;
  if (detail && detail.trim().length > 0) {
    return detail;
  }
  return `${baseLabel}: ${formatPercent(result.score, 1)}`;
};
