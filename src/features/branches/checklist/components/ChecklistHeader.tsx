import { Button, Datepicker, Label } from "flowbite-react";
import { HiOutlineRefresh } from "react-icons/hi";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import type { Branch } from "@/features/branches/branch/types";
import type { ChecklistSummary } from "../types/checklist.types";
import { formatFullDate } from "@/utils/date.utils";

interface ChecklistHeaderProps {
  branches: Branch[];
  selectedBranchIds: number[];
  onSelectedBranchIdsChange: (ids: number[]) => void;
  date: Date;
  onDateChange: (date: Date) => void;
  maxDate: Date;
  onRefresh: () => void;
  isRefreshing: boolean;
  summary: ChecklistSummary | null;
}

export default function ChecklistHeader({
  branches,
  selectedBranchIds,
  onSelectedBranchIdsChange,
  date,
  onDateChange,
  maxDate,
  onRefresh,
  isRefreshing,
  summary,
}: ChecklistHeaderProps) {
  const complete = summary?.branchesComplete ?? 0;
  const total = summary?.totalBranches ?? 0;
  const pending =
    (summary?.branchesPartial ?? 0) + (summary?.branchesEmpty ?? 0);

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Hoy
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {formatFullDate(toIsoDate(date))}
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Selecciona una fecha y las sucursales que quieres revisar.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_220px_auto] lg:items-end">
        <BranchMultiSelect
          branches={branches}
          selected={selectedBranchIds}
          onChange={onSelectedBranchIdsChange}
        />

        <div>
          <Label>Fecha</Label>
          <Datepicker
            language="es-MX"
            value={date}
            onChange={(d) => d && onDateChange(d)}
            maxDate={maxDate}
          />
        </div>

        <div className="flex items-end">
          <Button
            color="gray"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full lg:w-auto"
          >
            <HiOutlineRefresh
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              aria-hidden
            />
            Actualizar
          </Button>
        </div>
      </div>

      {summary && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4 text-xs">
          <SummaryChip
            tone="done"
            label={`${complete} de ${total} al corriente`}
          />
          <SummaryChip
            tone="warn"
            label={`${pending} sucursal${
              pending === 1 ? "" : "es"
            } con pendientes`}
          />
        </div>
      )}
    </section>
  );
}

const TONE_CLASSES: Record<"done" | "warn", string> = {
  done: "bg-emerald-900/30 text-emerald-300 ring-1 ring-emerald-700/40",
  warn: "bg-amber-900/30 text-amber-300 ring-1 ring-amber-700/40",
};

function SummaryChip({ tone, label }: { tone: "done" | "warn"; label: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 font-semibold tracking-wide uppercase ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
