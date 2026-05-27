import { useMemo, useState } from "react";
import { Alert, Spinner } from "flowbite-react";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { formatHumanDate, getLastDays } from "@/utils/date.utils";
import BranchProfitBatchTable from "../components/BranchProfitBatchTable";
import BranchProfitBranchBreakdown from "../components/BranchProfitBranchBreakdown";
import BranchProfitCashBreakdown from "../components/BranchProfitCashBreakdown";
import BranchProfitEmptyState from "../components/BranchProfitEmptyState";
import BranchProfitFilters from "../components/BranchProfitFilters";
import BranchProfitSummary from "../components/BranchProfitSummary";
import { useBranchProfitReport } from "../api/branch-profit.queries";
import type { BranchProfitFilters as BranchProfitFiltersDTO } from "../types";
import { buildBranchProfitSummary } from "../utils/profit-summary";

export default function BranchProfitReportPage() {
  const defaultRange = useMemo(() => getLastDays(7), []);
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(defaultRange.start);
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.end);
  const [activeFilters, setActiveFilters] =
    useState<BranchProfitFiltersDTO | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const reportQuery = useBranchProfitReport(activeFilters);
  const report = reportQuery.data ?? null;
  const summary = useMemo(() => buildBranchProfitSummary(report), [report]);

  const showSpinner = (loadingBranches || reportQuery.isLoading) && !report;
  const showFullError = reportQuery.isError && !report;
  const displayedBranchIds = activeFilters?.branchIds ?? selectedBranchIds;
  const selectedBranchNames = displayedBranchIds
    .map((id) => branches.find((branch) => branch.id === id)?.name)
    .filter(Boolean) as string[];
  const selectedBranchLabel =
    selectedBranchNames.length === 0
      ? "Ninguna sucursal seleccionada todavía"
      : selectedBranchNames.length === 1
        ? selectedBranchNames[0]
        : `${selectedBranchNames.slice(0, 2).join(", ")}${
            selectedBranchNames.length > 2
              ? ` +${selectedBranchNames.length - 2}`
              : ""
          }`;
  const scopeLabel = activeFilters
    ? `Rango ${formatHumanDate(activeFilters.startDate, "short")} - ${formatHumanDate(activeFilters.endDate, "short")}`
    : "Selecciona sucursales y periodo para generar el reporte";

  const handleSearch = () => {
    if (selectedBranchIds.length === 0 || !startDate || !endDate) {
      setValidationError("Selecciona sucursales y un rango de fechas.");
      return;
    }

    if (endDate < startDate) {
      setValidationError("La fecha final no puede ser menor a la inicial.");
      return;
    }

    setValidationError(null);
    setActiveFilters({
      branchIds: selectedBranchIds,
      startDate,
      endDate,
    });
  };

  const handleClearFilters = () => {
    setSelectedBranchIds([]);
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
    setActiveFilters(null);
    setValidationError(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Ganancias de sucursales
          </h1>
          <p className="text-sm text-slate-400">
            Revisión de ventas, gastos, costo de pollo, utilidad neta y efectivo
            esperado por periodo.
          </p>
        </div>
      </header>

      <BranchProfitFilters
        branches={branches}
        selectedBranchIds={selectedBranchIds}
        onSelectedBranchIdsChange={setSelectedBranchIds}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      {validationError && (
        <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
          {validationError}
        </Alert>
      )}

      {showSpinner ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : showFullError ? (
        <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
          No se pudo cargar el reporte de ganancias.
        </Alert>
      ) : report ? (
        <>
          <BranchProfitSummary
            summary={summary}
            scopeLabel={scopeLabel}
            selectedBranchLabel={selectedBranchLabel}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <BranchProfitBranchBreakdown items={summary.byBranch} />
            <BranchProfitCashBreakdown items={summary.byBusinessUnit} />
          </div>

          <BranchProfitBatchTable batches={report.batchDetails} />

          {reportQuery.isError && (
            <Alert
              color="warning"
              className="border border-amber-900/40 bg-amber-950/40 text-amber-100"
            >
              No se pudo refrescar el origen. Se muestran los datos ya cargados.
            </Alert>
          )}
        </>
      ) : (
        <BranchProfitEmptyState />
      )}
    </div>
  );
}
