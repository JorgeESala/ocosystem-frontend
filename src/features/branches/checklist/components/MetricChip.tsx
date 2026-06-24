import Tooltip from "@/components/Tooltip";
import { getMetricMeta } from "../config/metricRegistry";
import { scoreToTone, TONE_BG_CLASSES } from "../utils/performance-color";
import { describeMetric } from "../utils/indicator-sentences";
import type { MetricSummary } from "../types/checklist.types";

interface MetricChipProps {
  metric: MetricSummary;
}

export default function MetricChip({ metric }: MetricChipProps) {
  const meta = getMetricMeta(metric.id);
  const Icon = meta.icon;
  const tone = scoreToTone(metric.score);
  const toneClass = TONE_BG_CLASSES[tone];
  const sentence = describeMetric(metric);

  return (
    <Tooltip content={sentence} placement="top">
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${toneClass}`}>
        <Icon aria-hidden className="text-sm" />
        <span className="text-xs font-semibold text-slate-200">{meta.shortLabel}</span>
        <span className="text-xs font-bold tabular-nums text-white">
          {metric.score == null ? "—" : `${Math.round(metric.score)}%`}
        </span>
      </div>
    </Tooltip>
  );
}
