import { Link, useParams } from "react-router-dom";
import { HiClipboardList, HiArrowRight, HiCalendar } from "react-icons/hi";
import { useCurrentWeekPerformance } from "../api/checklist.queries";
import {
  scoreToTone,
  TONE_BG_CLASSES,
  TONE_CLASSES,
} from "../utils/performance-color";
import { formatPercent } from "../utils/format-score";
import { getCurrentWeek, toIsoDateString } from "../utils/week";
import { describeMetric } from "../utils/indicator-sentences";
import { formatFullDate } from "@/utils/date.utils";

export default function ChecklistDashboardWidget() {
  const { slug } = useParams();
  const { from } = getCurrentWeek();
  const fromIso = toIsoDateString(from);

  const { data, isLoading, isError } = useCurrentWeekPerformance();

  const combined = data?.summary?.combinedScore ?? null;
  const tone = scoreToTone(combined);
  const previous = data?.summary?.previousCombinedScore ?? null;
  const delta =
    combined != null && previous != null ? combined - previous : null;
  const evaluable = data?.summary?.evaluableBranches ?? 0;
  const total = data?.summary?.totalBranches ?? 0;
  const metrics = data?.summary?.metrics ?? [];

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5 transition hover:border-slate-500/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${TONE_BG_CLASSES[tone]}`}
          >
            <span className={TONE_CLASSES[tone]}>
              {isLoading ? "…" : formatPercent(combined, 0)}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Resultado de esta semana · {formatFullDate(fromIso)}
            </p>
            {isError ? (
              <p className="mt-1 text-sm text-rose-400">
                No se pudo cargar el resultado.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-300">
                <span className="font-semibold text-white">
                  {evaluable} de {total}
                </span>{" "}
                sucursales con datos
                {delta != null && delta !== 0 && (
                  <span
                    className={`ml-2 text-xs font-semibold ${delta > 0 ? "text-emerald-300" : "text-rose-300"}`}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(1)} puntos vs la semana anterior
                  </span>
                )}
              </p>
            )}
            {metrics.length > 0 && !isError && (
              <ul className="mt-2 space-y-0.5 text-[11px] text-slate-400">
                {metrics.map((m) => (
                  <li key={m.id}>· {describeMetric(m)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Link
            to={`/business/${slug}/checklist`}
            className="inline-flex items-center gap-1 self-end text-sm font-semibold text-blue-400 transition hover:gap-2"
          >
            <HiClipboardList aria-hidden className="text-base" />
            Ver checklist
            <HiArrowRight aria-hidden />
          </Link>
          <Link
            to={`/business/${slug}/checklist/calendar`}
            className="inline-flex items-center gap-1 self-end text-xs font-medium text-slate-400 transition hover:text-slate-200"
          >
            <HiCalendar aria-hidden />
            Configurar calendario
          </Link>
        </div>
      </div>
    </div>
  );
}
