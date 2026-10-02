import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiRefresh } from "react-icons/hi";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import DateRangePicker from "@/components/DateRangePicker";
import AttentionQueue from "../components/AttentionQueue";
import BranchHealthTable from "../components/BranchHealthTable";
import BusinessPulse from "../components/BusinessPulse";
import { useBranchesDashboard } from "../api/branchesDashboard.queries";
import type {
  BranchesDashboardCoverageDTO,
  BranchesDashboardSummaryDTO,
} from "../api/branchesDashboard.types";
import {
  buildAttentionItems,
  type BranchTaskSummary,
} from "../utils/attention";
import { expectedReportDays } from "@/features/branches/reports/utils/consolidatedMetrics";
import { useReportBranches } from "@/features/branches/branch/reportBranches.queries";
import { useDailyChecklist } from "@/features/branches/checklist/api/checklist.queries";
import { toLocalDateString } from "@/utils/date.utils";
import PendingTasksWidget from "@/features/branches/checklist/components/PendingTasksWidget";
import ChecklistDashboardWidget from "@/features/branches/checklist/components/ChecklistDashboardWidget";
import OrderPredictionWidget from "@/features/order-prediction/components/OrderPredictionWidget";

const PRESET_DAYS = [
  { label: "Hoy", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
];

const EMPTY_SUMMARY: BranchesDashboardSummaryDTO = {
  totalSales: 0,
  previousTotalSales: null,
  chickenSales: 0,
  previousChickenSales: null,
  otherProductsSales: 0,
  previousOtherProductsSales: null,
  chickenCosts: 0,
  chickenProfit: 0,
  mermaLossQuantity: 0,
  trimmedBranches: 0,
};

export default function BranchesDashboardPage() {
  const { slug } = useParams();
  const { branches, isLoading: branchesLoading } = useReportBranches();
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [dates, setDates] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  });

  const today = toLocalDateString(new Date());

  const effectiveBranchIds = useMemo(
    () =>
      selectedBranchIds.length > 0
        ? selectedBranchIds
        : branches.map((branch) => branch.id),
    [selectedBranchIds, branches],
  );

  const dashboardQuery = useBranchesDashboard(
    effectiveBranchIds,
    dates.start,
    dates.end,
  );
  const tasksQuery = useDailyChecklist({ date: today });

  const expectedDays = useMemo(
    () => expectedReportDays(dates.start, dates.end),
    [dates],
  );

  const taskSummaries = useMemo<BranchTaskSummary[]>(() => {
    const branchList = tasksQuery.data?.branches ?? [];
    return branchList.map((branch) => ({
      branchId: branch.branchId,
      branchName: branch.branchName,
      pending: branch.tasks.filter((task) => task.status === "EMPTY").length,
      late: branch.tasks.filter((task) => task.status === "EMPTY" && task.late)
        .length,
    }));
  }, [tasksQuery.data]);

  const attentionItems = useMemo(
    () =>
      buildAttentionItems({
        dashboard: dashboardQuery.data,
        expectedDays,
        tasks: taskSummaries,
        slug: slug ?? "sucursales",
        today,
      }),
    [dashboardQuery.data, expectedDays, taskSummaries, slug, today],
  );

  const coverage: BranchesDashboardCoverageDTO = dashboardQuery.data
    ?.coverage ?? {
    totalBranches: effectiveBranchIds.length,
    branchesWithPosReport: 0,
    branchesWithChickenSales: 0,
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    if (start && end) setDates({ start, end });
  };

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
    setDates({ start, end });
  };

  const refetchAll = () => {
    void dashboardQuery.refetch();
    void tasksQuery.refetch();
  };

  const isRefreshing = dashboardQuery.isFetching || tasksQuery.isFetching;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-4 border-b border-slate-800 pb-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Sucursales</h1>
          <p className="text-sm text-slate-400">
            Pulso del negocio para operar el día a día. La venta de pollo viene
            de Entradas y ventas; los demás productos, de los reportes POS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BranchMultiSelect
            branches={branches}
            selected={selectedBranchIds}
            onChange={setSelectedBranchIds}
          />
          <div className="flex items-center gap-1">
            {PRESET_DAYS.map((preset) => (
              <Button
                key={preset.days}
                size="xs"
                color="gray"
                onClick={() => applyPreset(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <DateRangePicker
            key={`${dates.start.getTime()}-${dates.end.getTime()}`}
            startDate={dates.start}
            endDate={dates.end}
            onChange={handleDateChange}
          />
          <Button color="gray" size="sm" onClick={refetchAll}>
            <HiRefresh className="mr-2 h-4 w-4" />
            {isRefreshing ? "Actualizando…" : "Actualizar"}
          </Button>
        </div>
      </header>

      <BusinessPulse
        summary={dashboardQuery.data?.summary ?? EMPTY_SUMMARY}
        coverage={coverage}
        slug={slug ?? "sucursales"}
        scope={{
          branchIds: effectiveBranchIds,
          start: dates.start,
          end: dates.end,
        }}
        period={
          dashboardQuery.data
            ? {
                start: dashboardQuery.data.startDate,
                end: dashboardQuery.data.endDate,
                previousStart: dashboardQuery.data.previousStartDate,
                previousEnd: dashboardQuery.data.previousEndDate,
              }
            : undefined
        }
        isLoading={dashboardQuery.isLoading || branchesLoading}
        isError={dashboardQuery.isError}
        onRetry={() => void dashboardQuery.refetch()}
      />

      <AttentionQueue
        items={attentionItems}
        isLoading={dashboardQuery.isLoading || tasksQuery.isLoading}
        isError={tasksQuery.isError}
        onRetry={refetchAll}
      />

      <BranchHealthTable
        rows={dashboardQuery.data?.branches ?? []}
        expectedDays={expectedDays}
        slug={slug ?? "sucursales"}
        isLoading={dashboardQuery.isLoading || branchesLoading}
        isError={dashboardQuery.isError}
        onRetry={() => void dashboardQuery.refetch()}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
          Planeación y desempeño
        </h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PendingTasksWidget />
          <ChecklistDashboardWidget
            scope={{
              branchIds: effectiveBranchIds,
              start: dates.start,
              end: dates.end,
            }}
          />
        </div>
        <OrderPredictionWidget />
      </section>
    </div>
  );
}
