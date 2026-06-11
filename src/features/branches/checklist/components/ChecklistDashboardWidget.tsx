import { Link, useParams } from "react-router-dom";
import { HiClipboardList, HiArrowRight, HiExclamation } from "react-icons/hi";
import { Spinner } from "flowbite-react";
import { useDailyChecklist } from "../api/checklist.queries";
import { toLocalDateString, formatFullDate } from "@/utils/date.utils";

export default function ChecklistDashboardWidget() {
  const { slug } = useParams();
  const today = toLocalDateString(new Date());

  const { data, isLoading, isError } = useDailyChecklist({
    date: today,
  });

  const summary = data?.summary;
  const complete = summary?.branchesComplete ?? 0;
  const total = summary?.totalBranches ?? 0;
  const pending = data
    ? data.branches.reduce(
        (acc, b) => acc + b.tasks.filter((t) => t.status === "PENDING").length,
        0,
      )
    : 0;

  return (
    <Link
      to={`/business/${slug}/checklist`}
      className="group block rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5 transition hover:border-slate-500/80 hover:bg-slate-900"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900/30 text-blue-400 ring-1 ring-blue-700/40">
            <HiClipboardList aria-hidden className="text-lg" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Checklist de hoy · {formatFullDate(today)}
            </p>
            {isLoading ? (
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <Spinner size="sm" /> Cargando...
              </div>
            ) : isError ? (
              <p className="mt-1 text-sm text-rose-400">
                No se pudo cargar el checklist.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-300">
                <span className="font-semibold text-white">
                  {complete} de {total}
                </span>{" "}
                sucursales al corriente
                {pending > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-900/30 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-300 uppercase ring-1 ring-amber-700/40">
                    <HiExclamation aria-hidden />
                    {pending} pendiente{pending === 1 ? "" : "s"}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <span className="inline-flex items-center gap-1 self-end text-sm font-semibold text-blue-400 transition group-hover:gap-2 sm:self-auto">
          Ver
          <HiArrowRight aria-hidden />
        </span>
      </div>
    </Link>
  );
}
