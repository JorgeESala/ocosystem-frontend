import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Button } from "flowbite-react";
import { Link, useParams } from "react-router-dom";
import { HiQuestionMarkCircle, HiCog } from "react-icons/hi";
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
import { useAuthRole } from "@/hooks/useAuthRole";

const RANGE_PRESETS: Record<Exclude<DateRangePreset, "custom">, () => { from: Date; to: Date }> = {
  "current-week": getCurrentWeek,
  "last-week": getLastWeek,
  "last-7": getLast7Days,
  "last-30": getLast30Days,
  "current-month": getCurrentMonth,
};

export default function ChecklistPage() {
  const { slug } = useParams();
  const { isAdmin } = useAuthRole();
  const initial = useMemo(() => getCurrentWeek(), []);
  
  // Applied state - what the query uses
  const [appliedFrom, setAppliedFrom] = useState<Date>(initial.from);
  const [appliedTo, setAppliedTo] = useState<Date>(initial.to);
  
  // Pending state - what the user is editing
  const [pendingFrom, setPendingFrom] = useState<Date>(initial.from);
  const [pendingTo, setPendingTo] = useState<Date>(initial.to);
  
  const [preset, setPreset] = useState<DateRangePreset>("current-week");
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [expandedBranchId, setExpandedBranchId] = useState<number | null>(null);
  const [daysIncluded, setDaysIncluded] = useState(false);

  const { data: branches = [], isLoading: loadingBranches } = useBranches();

  const branchIds = useMemo(
    () => [...selectedBranchIds].sort((a, b) => a - b),
    [selectedBranchIds],
  );

  // Compute unsaved days for the badge
  const unsavedDays = useMemo(() => {
    const appliedDays = Math.floor((appliedTo.getTime() - appliedFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const pendingDays = Math.floor((pendingTo.getTime() - pendingFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return appliedDays !== pendingDays || appliedFrom.getTime() !== pendingFrom.getTime() || appliedTo.getTime() !== pendingTo.getTime();
  }, [appliedFrom, appliedTo, pendingFrom, pendingTo]);

  const query = useBranchPerformance({
    from: toIsoDateString(appliedFrom),
    to: toIsoDateString(appliedTo),
    branchIds: branchIds.length > 0 ? branchIds : undefined,
    includeDays: daysIncluded,
  });

  useEffect(() => {
    if (preset === "custom") {
      return;
    }
    const fn = RANGE_PRESETS[preset];
    const next = fn();
    setPendingFrom(next.from);
    setPendingTo(next.to);
  }, [preset]);

  const handlePendingChange = (nextFrom: Date, nextTo: Date) => {
    setPreset("custom");
    setPendingFrom(nextFrom);
    setPendingTo(nextTo);
  };

  const handleApply = () => {
    setAppliedFrom(pendingFrom);
    setAppliedTo(pendingTo);
  };

  const handleToggleRow = (branchId: number) => {
    const next = expandedBranchId === branchId ? null : branchId;
    setExpandedBranchId(next);
    if (next != null && !daysIncluded) {
      setDaysIncluded(true);
    }
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
        <div className="flex gap-2">
          <Link to={`/business/${slug}/checklist/help`}>
            <Button color="light" size="sm">
              <HiQuestionMarkCircle aria-hidden className="mr-2 h-4 w-4" />
              Ayuda
            </Button>
          </Link>
          {isAdmin && (
            <>
              <Link to={`/business/${slug}/checklist/weights`}>
                <Button color="light" size="sm">
                  <HiCog aria-hidden className="mr-2 h-4 w-4" />
                  Importancias
                </Button>
              </Link>
              <Link to={`/business/${slug}/checklist/formulas`}>
                <Button color="light" size="sm">
                  <HiCog aria-hidden className="mr-2 h-4 w-4" />
                  Configurar fórmulas
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <ChecklistHeader
        branches={branches}
        selectedBranchIds={selectedBranchIds}
        onSelectedBranchIdsChange={setSelectedBranchIds}
        pendingFrom={pendingFrom}
        pendingTo={pendingTo}
        onPendingChange={handlePendingChange}
        preset={preset}
        onPresetChange={setPreset}
        onApply={handleApply}
        isApplying={query.isFetching}
        unsavedChanges={unsavedDays}
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
        <ChecklistGrid 
          branches={query.data?.branches ?? []} 
          expandedBranchId={expandedBranchId}
          onToggleRow={handleToggleRow}
        />
      )}
    </div>
  );
}
