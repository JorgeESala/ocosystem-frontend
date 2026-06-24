import Tooltip from "@/components/Tooltip";
import { getMetricMeta } from "../config/metricRegistry";
import { scoreToTone } from "../utils/performance-color";
import { describeMetric } from "../utils/indicator-sentences";
import { formatPercent } from "../utils/format-score";
import PerformanceBar from "./PerformanceBar";
import type { BranchChecklist } from "../types/checklist.types";

interface BranchPerformanceRowProps {
  branch: BranchChecklist;
}

export default function BranchPerformanceRow({ branch }: BranchPerformanceRowProps) {
  const combined = branch.combinedScore ?? null;
  const tone = scoreToTone(combined);
  const metricResults = branch.metricResults ?? [];

  return (
    <tr className="border-b border-slate-800/60 transition hover:bg-slate-900/40">
      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-white">{branch.branchName}</span>
          {branch.personInCharge && (
            <span className="text-[11px] text-slate-400">
              {branch.personInCharge.name ?? "Sin encargado"}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-3 min-w-[280px]">
          {metricResults.length === 0 ? (
            <span className="text-xs text-slate-500">Sin indicadores</span>
          ) : (
            metricResults.map((m) => {
              const meta = getMetricMeta(m.id);
              const Icon = meta.icon;
              const sentence = describeMetric(m);
              return (
                <Tooltip key={m.id} content={sentence} placement="left">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Icon aria-hidden className="text-sm text-slate-400" />
                      <div className="min-w-[120px] text-[11px] font-medium text-slate-300">
                        {meta.shortLabel}
                      </div>
                      <div className="min-w-[3rem] text-right text-[11px] font-semibold tabular-nums text-slate-200">
                        {m.evaluable ? formatPercent(m.score, 0) : "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-[120px]" />
                      <div className="flex-1">
                        <PerformanceBar value={m.score} tone={scoreToTone(m.score)} />
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {sentence}
                    </div>
                  </div>
                </Tooltip>
              );
            })
          )}
        </div>
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <div className={`inline-flex h-14 min-w-[4.5rem] items-center justify-center rounded-xl px-4 text-xl font-bold ${
          tone === "good"
            ? "bg-emerald-900/30 text-emerald-200 ring-1 ring-emerald-700/40"
            : tone === "warn"
              ? "bg-amber-900/30 text-amber-200 ring-1 ring-amber-700/40"
              : tone === "bad"
                ? "bg-rose-900/30 text-rose-200 ring-1 ring-rose-700/40"
                : "bg-slate-800 text-slate-300 ring-1 ring-slate-700/60"
        }`}>
          {formatPercent(combined, 0)}
        </div>
      </td>
    </tr>
  );
}
