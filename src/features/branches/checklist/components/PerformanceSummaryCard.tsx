import { HiArrowDown, HiArrowUp, HiMinus } from "react-icons/hi";
import { Card } from "flowbite-react";
import {
  scoreToTone,
  TONE_BG_CLASSES,
  TONE_CLASSES,
} from "../utils/performance-color";
import { formatPercent } from "../utils/format-score";
import MetricChip from "./MetricChip";
import type { ChecklistSummary } from "../types/checklist.types";

interface PerformanceSummaryCardProps {
  summary: ChecklistSummary | null;
  loading?: boolean;
}

export default function PerformanceSummaryCard({
  summary,
  loading,
}: PerformanceSummaryCardProps) {
  const combined = summary?.combinedScore ?? null;
  const previous = summary?.previousCombinedScore ?? null;
  const delta =
    combined != null && previous != null ? combined - previous : null;
  const tone = scoreToTone(combined);
  const toneClass = TONE_CLASSES[tone];
  const ringClass = TONE_BG_CLASSES[tone];

  const trendIcon =
    delta == null ? (
      <HiMinus aria-hidden className="text-sm text-slate-500" />
    ) : delta > 0 ? (
      <HiArrowUp aria-hidden className="text-sm text-emerald-300" />
    ) : delta < 0 ? (
      <HiArrowDown aria-hidden className="text-sm text-rose-300" />
    ) : (
      <HiMinus aria-hidden className="text-sm text-slate-500" />
    );

  const trendLabel =
    delta == null
      ? "Sin periodo anterior"
      : delta === 0
        ? "Igual que el periodo anterior"
        : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} puntos vs el periodo anterior`;

  return (
    <Card className="border-slate-700/80 bg-slate-950/70">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div
            className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold ${ringClass}`}
          >
            <span className={toneClass}>
              {loading ? "…" : formatPercent(combined, 0)}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Resultado general de las sucursales
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {summary?.evaluableBranches ?? 0} de {summary?.totalBranches ?? 0}{" "}
              sucursales con datos
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {trendIcon}
              <span className="text-slate-400">{trendLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {summary?.metrics?.map((m) => (
            <MetricChip key={m.id} metric={m} />
          ))}
        </div>
      </div>
      {summary?.metrics?.some((m) => m.evaluableBranches === 0) && (
        <p className="text-[11px] text-amber-300">
          Algunos indicadores no tienen datos en el periodo; quedan excluidos
          del puntaje general.
        </p>
      )}
    </Card>
  );
}
