import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "flowbite-react";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { useBranchPerformance } from "../api/checklist.queries";
import ChecklistGrid from "../components/ChecklistGrid";
import ChecklistHeader, { type DateRangePreset } from "../components/ChecklistHeader";
import PerformanceSummaryCard from "../components/PerformanceSummaryCard";
import { toIsoDateString } from "../utils/week";
import {
  getCurrentMonth,
  getCurrentWeek,
  getLast30Days,
  getLast7Days,
  getLastWeek,
} from "../utils/week";

const RANGE_PRESETS: Record<Exclude<DateRangePreset, "custom">, () => { from: Date; to: Date }> = {
  "current-week": getCurrentWeek,
  "last-week": getLastWeek,
  "last-7": getLast7Days,
  "last-30": getLast30Days,
  "current-month": getCurrentMonth,
};

export default function ChecklistPage() {
  const initial = useMemo(() => getCurrentWeek(), []);
  const [from, setFrom] = useState<Date>(initial.from);
  const [to, setTo] = useState<Date>(initial.to);
  const [preset, setPreset] = useState<DateRangePreset>("current-week");
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

  const { data: branches = [], isLoading: loadingBranches } = useBranches();

  const branchIds = useMemo(
    () => [...selectedBranchIds].sort((a, b) => a - b),
    [selectedBranchIds],
  );

  const query = useBranchPerformance({
    from: toIsoDateString(from),
    to: toIsoDateString(to),
    branchIds: branchIds.length > 0 ? branchIds : undefined,
  });

  useEffect(() => {
    if (preset === "custom") {
      return;
    }
    const fn = RANGE_PRESETS[preset];
    const next = fn();
    setFrom(next.from);
    setTo(next.to);
  }, [preset]);

  const handleRangeChange = (nextFrom: Date, nextTo: Date) => {
    setPreset("custom");
    setFrom(nextFrom);
    setTo(nextTo);
  };

  const isLoading = query.isLoading || loadingBranches;
  const isError = query.isError;
  const hasData = Boolean(query.data);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Checklist diario</h1>
          <p className="text-sm text-slate-400">
            Resultado por sucursal y por todas las sucursales a partir de las tareas y ventas registradas.
          </p>
        </div>
      </header>

      <ChecklistHeader
        branches={branches}
        selectedBranchIds={selectedBranchIds}
        onSelectedBranchIdsChange={setSelectedBranchIds}
        from={from}
        to={to}
        onRangeChange={handleRangeChange}
        preset={preset}
        onPresetChange={setPreset}
        onRefresh={() => query.refetch()}
        isRefreshing={query.isFetching}
        summary={query.data?.summary ?? null}
      />

      <PerformanceSummaryCard
        summary={query.data?.summary ?? null}
        loading={isLoading}
      />

      {isError && hasData && (
        <Alert
          color="warning"
          className="border border-amber-900/40 bg-amber-950/40 text-amber-100"
        >
          No se pudo refrescar el resultado. Se muestra la última respuesta disponible.
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : isError && !hasData ? (
        <Alert
          color="failure"
          className="border border-red-900/40 bg-red-950/40"
        >
          No se pudo cargar el resultado. Intenta actualizar.
        </Alert>
      ) : query.data && query.data.branches.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
          No hay sucursales registradas.
        </div>
      ) : query.data &&
        (query.data.branches.every((b) => (b.metricResults ?? []).every((m) => !m.evaluable)) &&
          query.data.summary.evaluableBranches === 0) ? (
        <Alert
          color="info"
          className="border border-blue-900/40 bg-blue-950/40 text-blue-100"
        >
          Ningún indicador tiene datos en el periodo. Configura el calendario de
          fechas esperadas para empezar a medir el resultado.
        </Alert>
      ) : (
        <ChecklistGrid branches={query.data?.branches ?? []} />
      )}
    </div>
  );
}
