import { useMemo, useState } from "react";
import { Alert, Spinner } from "flowbite-react";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { useBranchExpensesSearch } from "@/features/branches/expenses/api/branch-expenses.queries";
import { formatHumanDate, getLastDays } from "@/utils/date.utils";
import BranchProfitBatchTable from "../components/BranchProfitBatchTable";
import BranchProfitExpenseAudit from "../components/BranchProfitExpenseAudit";
import BranchProfitBranchBreakdown from "../components/BranchProfitBranchBreakdown";
import BranchProfitCashBreakdown from "../components/BranchProfitCashBreakdown";
import BranchProfitEmptyState from "../components/BranchProfitEmptyState";
import BranchProfitFilters from "../components/BranchProfitFilters";
import BranchProfitSalesSourceBanner from "../components/BranchProfitSalesSourceBanner";
import BranchProfitSummary from "../components/BranchProfitSummary";
import { useBranchProfitReport } from "../api/branch-profit.queries";
import { useImportedSalesByBranches } from "../api/useImportedSalesByBranches";
import { useBatchSalesByDateRange } from "../api/useBatchSalesByDateRange";
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
  const expensesQuery = useBranchExpensesSearch(activeFilters);
  const expenses = expensesQuery.data ?? [];

  const importedSales = useImportedSalesByBranches({
    branchIds: activeFilters?.branchIds ?? [],
    startDate: activeFilters?.startDate ?? null,
    endDate: activeFilters?.endDate ?? null,
    branches,
  });

  const batchSalesDaily = useBatchSalesByDateRange(
    activeFilters?.branchIds ?? [],
    activeFilters?.startDate ?? null,
    activeFilters?.endDate ?? null,
  );

  const summary = useMemo(
    () => buildBranchProfitSummary(report),
    [report],
  );

  const manualChickenByBranch = useMemo(() => {
    const map = new Map<
      number,
      { branchId: number; branchName: string; manualChicken: number }
    >();
    const batchDetails = report?.batchDetails ?? [];
    const selectedIds = activeFilters?.branchIds ?? [];
    for (const branchId of selectedIds) {
      const branch = branches.find((b) => b.id === branchId);
      if (!branch) continue;
      const manualChicken = batchDetails
        .filter((b) => b.branchName === branch.name)
        .reduce(
          (sum, b) => sum + (Number(b.totalSalesInRange) || 0),
          0,
        );
      map.set(branchId, {
        branchId,
        branchName: branch.name,
        manualChicken,
      });
    }
    return map;
  }, [report?.batchDetails, branches, activeFilters?.branchIds]);

  const chickenComparison = useMemo(() => {
    const branchNameById = new Map<number, string>();
    for (const branch of branches) {
      branchNameById.set(branch.id, branch.name);
    }
    const ids = new Set<number>([
      ...importedSales.byBranch.map((b) => b.branchId),
      ...manualChickenByBranch.keys(),
    ]);
    return Array.from(ids).map((branchId) => {
      const imported = importedSales.byBranch.find(
        (b) => b.branchId === branchId,
      );
      const manual = manualChickenByBranch.get(branchId);
      return {
        branchId,
        branchName:
          imported?.branchName ??
          manual?.branchName ??
          branchNameById.get(branchId) ??
          `Sucursal ${branchId}`,
        importedChicken: imported?.byCategory["pollo"] ?? 0,
        manualChicken: manual?.manualChicken ?? 0,
      };
    });
  }, [
    importedSales.byBranch,
    manualChickenByBranch,
    branches,
  ]);

  const dailyComparison = useMemo(() => {
    const mergedDates = new Set<string>();
    for (const dayMap of importedSales.dailyTotalsByBranch.values()) {
      for (const d of dayMap.keys()) mergedDates.add(d);
    }
    for (const d of batchSalesDaily.dailyTotals.keys()) mergedDates.add(d);

    return Array.from(mergedDates)
      .sort()
      .map((date) => {
        let importedTotal = 0;
        for (const dayMap of importedSales.dailyTotalsByBranch.values()) {
          importedTotal += dayMap.get(date) ?? 0;
        }
        const manualTotal = batchSalesDaily.dailyTotals.get(date) ?? 0;
        return { date, importedTotal, manualTotal, diff: manualTotal - importedTotal };
      });
  }, [importedSales.dailyTotalsByBranch, batchSalesDaily.dailyTotals]);

  const dailyQuantityComparison = useMemo(() => {
    const mergedDates = new Set<string>();
    for (const dayMap of importedSales.dailyMatadosByBranch.values()) {
      for (const d of dayMap.keys()) mergedDates.add(d);
    }
    for (const d of batchSalesDaily.dailyQuantityByDate.keys()) mergedDates.add(d);

    return Array.from(mergedDates)
      .sort()
      .map((date) => {
        let matadosQty = 0;
        for (const dayMap of importedSales.dailyMatadosByBranch.values()) {
          matadosQty += dayMap.get(date) ?? 0;
        }
        const batchQty = batchSalesDaily.dailyQuantityByDate.get(date) ?? 0;
        return { date, matadosQty, batchQty, diff: batchQty - matadosQty };
      });
  }, [importedSales.dailyMatadosByBranch, batchSalesDaily.dailyQuantityByDate]);

  const branchBreakdown = useMemo(() => {
    return chickenComparison.map((row) => {
      const matadosByDate = importedSales.dailyMatadosByBranch.get(row.branchId);
      let matadosQty = 0;
      if (matadosByDate) {
        for (const qty of matadosByDate.values()) matadosQty += qty;
      }
      const batchByDate = batchSalesDaily.dailyQuantityByBranch.get(row.branchId);
      let batchQty = 0;
      if (batchByDate) {
        for (const qty of batchByDate.values()) batchQty += qty;
      }
      return {
        ...row,
        matadosQty,
        batchQty,
        qtyDiff: batchQty - matadosQty,
      };
    });
  }, [chickenComparison, importedSales.dailyMatadosByBranch, batchSalesDaily.dailyQuantityByBranch]);

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

    const startOfDay = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };
    if (startOfDay(endDate) < startOfDay(startDate)) {
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
          <BranchProfitSalesSourceBanner
            byBranch={chickenComparison}
            dailyComparison={dailyComparison}
            dailyQuantityComparison={dailyQuantityComparison}
            branchBreakdown={branchBreakdown}
            isLoading={importedSales.isLoading}
            isError={importedSales.isError}
          />

          <BranchProfitSummary
            summary={summary}
            scopeLabel={scopeLabel}
            selectedBranchLabel={selectedBranchLabel}
          />

          <BranchProfitCashBreakdown items={summary.byBusinessUnit} />

          <BranchProfitBranchBreakdown items={summary.byBranch} />

          <BranchProfitExpenseAudit
            expenses={expenses}
            totalSales={summary.totalSales}
            isLoading={expensesQuery.isLoading}
            isError={expensesQuery.isError}
            scopeLabel={scopeLabel}
          />

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
