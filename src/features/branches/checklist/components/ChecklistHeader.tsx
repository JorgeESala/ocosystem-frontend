import { Button, Label, Badge } from "flowbite-react";
import { Datepicker } from "flowbite-react";
import { HiOutlineRefresh, HiCalendar } from "react-icons/hi";
import { Link, useParams } from "react-router-dom";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import type { Branch } from "@/features/branches/branch/types";
import type { ChecklistSummary } from "../types/checklist.types";
import { formatFullDate } from "@/utils/date.utils";
import { toIsoDateString } from "../utils/week";

export type DateRangePreset =
  | "current-week"
  | "last-week"
  | "last-7"
  | "last-30"
  | "current-month"
  | "custom";

interface ChecklistHeaderProps {
  branches: Branch[];
  selectedBranchIds: number[];
  onSelectedBranchIdsChange: (ids: number[]) => void;
  pendingFrom: Date;
  pendingTo: Date;
  onPendingChange: (from: Date, to: Date) => void;
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  onApply: () => void;
  isApplying: boolean;
  unsavedChanges: boolean;
  summary: ChecklistSummary | null;
}

export default function ChecklistHeader({
  branches,
  selectedBranchIds,
  onSelectedBranchIdsChange,
  pendingFrom,
  pendingTo,
  onPendingChange,
  preset,
  onPresetChange,
  onApply,
  isApplying,
  unsavedChanges,
  summary,
}: ChecklistHeaderProps) {
  const { slug } = useParams();
  const maxDate = new Date();

  const presetButtons: { id: DateRangePreset; label: string }[] = [
    { id: "current-week", label: "Esta semana" },
    { id: "last-week", label: "Semana pasada" },
    { id: "last-7", label: "Últimos 7 días" },
    { id: "last-30", label: "Últimos 30 días" },
    { id: "current-month", label: "Este mes" },
    { id: "custom", label: "Personalizado" },
  ];

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Periodo
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {formatFullDate(toIsoDateString(pendingFrom))} –{" "}
            {formatFullDate(toIsoDateString(pendingTo))}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {presetButtons.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPresetChange(p.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                preset === p.id
                  ? "bg-blue-900/40 text-blue-200 ring-1 ring-blue-700/50"
                  : "bg-slate-800/60 text-slate-300 ring-1 ring-slate-700/60 hover:bg-slate-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_180px_180px_auto] lg:items-end">
        <BranchMultiSelect
          branches={branches}
          selected={selectedBranchIds}
          onChange={onSelectedBranchIdsChange}
        />
        <div>
          <Label>Desde</Label>
          <Datepicker
            language="es-MX"
            value={pendingFrom}
            onChange={(d) =>
              d && onPendingChange(d, pendingTo < d ? d : pendingTo)
            }
            maxDate={pendingTo > maxDate ? pendingTo : maxDate}
          />
        </div>
        <div>
          <Label>Hasta</Label>
          <Datepicker
            language="es-MX"
            value={pendingTo}
            onChange={(d) =>
              d && onPendingChange(pendingFrom > d ? d : pendingFrom, d)
            }
            maxDate={maxDate}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            color="blue"
            onClick={onApply}
            disabled={isApplying || !unsavedChanges}
            className="relative w-full lg:w-auto"
          >
            <HiOutlineRefresh
              className={`mr-2 h-4 w-4 ${isApplying ? "animate-spin" : ""}`}
              aria-hidden
            />
            Actualizar
            {unsavedChanges && (
              <Badge color="warning" className="absolute -top-2 -right-2">
                !
              </Badge>
            )}
          </Button>
          <Link to={`/business/${slug}/checklist/calendar`}>
            <Button color="light" className="w-full lg:w-auto">
              <HiCalendar aria-hidden className="mr-2 h-4 w-4" />
              Calendario
            </Button>
          </Link>
        </div>
      </div>

      {summary && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <span>
            {summary.evaluableBranches ?? 0} de {summary.totalBranches}{" "}
            sucursales con datos
          </span>
          {summary.combinedScore != null && (
            <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-slate-300 ring-1 ring-slate-700/50">
              Puntaje general: {summary.combinedScore.toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </section>
  );
}
