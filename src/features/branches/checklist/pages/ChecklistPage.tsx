import { useMemo, useState } from "react";
import { Alert, Spinner } from "flowbite-react";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { useDailyChecklist } from "../api/checklist.queries";
import ChecklistGrid from "../components/ChecklistGrid";
import ChecklistHeader from "../components/ChecklistHeader";
import { toLocalDateString } from "@/utils/date.utils";

export default function ChecklistPage() {
  const today = useMemo(() => new Date(), []);
  const maxDate = useMemo(() => new Date(), []);

  const [date, setDate] = useState<Date>(today);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

  const { data: branches = [], isLoading: loadingBranches } = useBranches();

  const apiDate = toLocalDateString(date);
  const branchIds = useMemo(
    () =>
      selectedBranchIds.length > 0 ? [...selectedBranchIds].sort((a, b) => a - b) : [],
    [selectedBranchIds],
  );

  const query = useDailyChecklist({
    date: apiDate,
    branchIds: branchIds.length > 0 ? branchIds : undefined,
  });

  const isLoadingBranches = loadingBranches;
  const isLoading = query.isLoading || isLoadingBranches;
  const isError = query.isError;
  const hasData = Boolean(query.data);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Checklist diario</h1>
          <p className="text-sm text-slate-400">
            Tareas clave del dia para cada sucursal. Todo se calcula a partir
            de los datos ya cargados en el sistema.
          </p>
        </div>
      </header>

      <ChecklistHeader
        branches={branches}
        selectedBranchIds={selectedBranchIds}
        onSelectedBranchIdsChange={setSelectedBranchIds}
        date={date}
        onDateChange={setDate}
        maxDate={maxDate}
        onRefresh={() => query.refetch()}
        isRefreshing={query.isFetching}
        summary={query.data?.summary ?? null}
      />

      {isError && hasData && (
        <Alert
          color="warning"
          className="border border-amber-900/40 bg-amber-950/40 text-amber-100"
        >
          No se pudo refrescar el checklist. Se muestra la ultima respuesta
          disponible.
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
          No se pudo cargar el checklist. Intenta actualizar.
        </Alert>
      ) : query.data && query.data.branches.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
          No hay sucursales registradas.
        </div>
      ) : (
        <ChecklistGrid
          branches={query.data?.branches ?? []}
          now={new Date()}
        />
      )}
    </div>
  );
}
