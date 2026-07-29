import { useState, useMemo, useEffect } from "react";
import { Datepicker, Button, Spinner } from "flowbite-react";
import { HiDownload } from "react-icons/hi";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useBranches } from "@/features/branches/branch/branch.queries";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import { useSalesAnalytics } from "../api/salesAnalytics.queries";
import { salesAnalyticsApi } from "../api/salesAnalytics.api";
import type { SalesAnalyticsDTO, DailySalesDTO } from "../types";

const BRANCH_COLORS: Record<string, string> = {
  Roneli: "#FF6B6B",
  "Express JMM": "#4ECDC4",
  Amanecer: "#FFA500",
  "Express FCP": "#556270",
  Saban: "#C44DFF",
  Esperanza: "#3498DB",
  "Express Chunhuhub": "#E67E22",
  Procesado: "#2ECC71",
  Cancabchen: "#9B59B6",
};

function getGrowthColor(growth: number): string {
  if (growth > 5) return "text-emerald-400";
  if (growth < -5) return "text-red-400";
  return "text-slate-400";
}

function getGrowthArrow(growth: number): string {
  if (growth > 5) return "\u2191";
  if (growth < -5) return "\u2193";
  return "\u2192";
}

function formatDayName(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
  });
}

export default function SalesAnalyticsContent() {
  const { data: branches = [] } = useBranches();
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [activeProduct, setActiveProduct] = useState<"chicken" | "eggs">(
    "chicken",
  );
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null);

  useEffect(() => {
    if (branches.length > 0 && selectedBranchIds.length === 0) {
      setSelectedBranchIds(branches.map((b) => b.id));
    }
  }, [branches]);

  const { data, isLoading, refetch } = useSalesAnalytics(
    selectedBranchIds,
    startDate,
    endDate,
  );

  // Clear selectedWeek when data changes to prevent stale state
  useEffect(() => {
    setSelectedWeek(null);
  }, [data]);

  const presetRanges = [
    { label: "7 dias", days: 7 },
    { label: "2 semanas", days: 14 },
    { label: "1 mes", days: 30 },
    { label: "3 meses", days: 90 },
  ];

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start);
    setEndDate(end);
  };

  const chartData = useMemo(() => {
    if (!data?.dailySales) return [];
    return data.dailySales.map((d) => {
      const point: Record<string, string | number> = {
        date: new Date(d.date + "T00:00:00").toLocaleDateString("es-MX", {
          day: "numeric",
          month: "short",
        }),
        _rawDate: d.date,
      };
      if (activeProduct === "chicken") {
        for (const [branch, qty] of Object.entries(d.chickenByBranch)) {
          point[branch] = qty;
        }
      } else {
        for (const [branch, qty] of Object.entries(d.eggsByBranch)) {
          point[branch] = qty;
        }
      }
      return point;
    });
  }, [data, activeProduct]);

  const activeBranchNames = useMemo(() => {
    if (!data?.dailySales?.length) return [];
    const names = new Set<string>();
    for (const d of data.dailySales) {
      const source =
        activeProduct === "chicken" ? d.chickenByBranch : d.eggsByBranch;
      for (const branch of Object.keys(source)) {
        names.add(branch);
      }
    }
    return Array.from(names).filter((name) => {
      return data.dailySales.some((d) => {
        const source =
          activeProduct === "chicken" ? d.chickenByBranch : d.eggsByBranch;
        return (source[name] ?? 0) > 0;
      });
    });
  }, [data, activeProduct]);

  const handleExport = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();

    const summaryData = [
      ["Resumen de Ventas"],
      [""],
      ["Periodo", `${data.startDate} - ${data.endDate}`],
      ["Días con datos", data.summary.daysInRange],
      [""],
      ["Total Pollo", data.summary.totalChicken],
      ["Total Huevo (casilleros)", data.summary.totalEggs],
      [""],
      ["Promedio diario Pollo", data.summary.avgDailyChicken],
      ["Promedio diario Huevo", data.summary.avgDailyEggs],
      [""],
      ["Crecimiento Pollo vs mes ant.", `${data.summary.chickenGrowth}%`],
      ["Crecimiento Huevo vs mes ant.", `${data.summary.eggsGrowth}%`],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

    const dailyHeaders = ["Fecha", ...activeBranchNames, "Total"];
    const dailyRows = data.dailySales.map((d) => {
      const source = activeProduct === "chicken" ? d.chickenByBranch : d.eggsByBranch;
      const total = activeProduct === "chicken" ? d.totalChicken : d.totalEggs;
      return [
        d.date,
        ...activeBranchNames.map((name) => source[name] ?? 0),
        total,
      ];
    });
    const wsDaily = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyRows]);
    wsDaily["!cols"] = [{ wch: 12 }, ...activeBranchNames.map(() => ({ wch: 15 })), { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsDaily, "Ventas Diarias");

    const weeklyHeaders = ["Semana", ...activeBranchNames, "Total"];
    const weeklyRows = data.weeklySummary.map((w) => {
      const source = activeProduct === "chicken" ? w.chickenByBranch : w.eggsByBranch;
      const total = activeProduct === "chicken" ? w.totalChicken : w.totalEggs;
      return [
        w.weekLabel,
        ...activeBranchNames.map((name) => source[name] ?? 0),
        total,
      ];
    });
    const wsWeekly = XLSX.utils.aoa_to_sheet([weeklyHeaders, ...weeklyRows]);
    wsWeekly["!cols"] = [{ wch: 20 }, ...activeBranchNames.map(() => ({ wch: 15 })), { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsWeekly, "Resumen Semanal");

    const growthHeaders = [
      "Sucursal",
      "Pollo Actual", "Pollo Anterior", "Pollo Crecimiento %",
      "Huevo Actual", "Huevo Anterior", "Huevo Crecimiento %",
    ];
    const growthRows = data.branchGrowth.map((b) => [
      b.branchName,
      b.currentChicken, b.previousChicken, `${b.chickenGrowth}%`,
      b.currentEggs, b.previousEggs, `${b.eggsGrowth}%`,
    ]);
    const wsGrowth = XLSX.utils.aoa_to_sheet([growthHeaders, ...growthRows]);
    wsGrowth["!cols"] = [{ wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsGrowth, "Crecimiento");

    XLSX.writeFile(wb, `ventas-${activeProduct}-${startDate.toISOString().split("T")[0]}.xlsx`);
  };

  const handleExportPdf = async () => {
    if (!data || selectedBranchIds.length === 0) return;
    const blob = await salesAnalyticsApi.downloadPdf(
      selectedBranchIds,
      startDate,
      endDate,
      activeProduct,
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventas-${activeProduct}-${startDate.toISOString().split("T")[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1">
          {presetRanges.map((preset) => (
            <button
              key={preset.days}
              onClick={() => applyPreset(preset.days)}
              className="rounded bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-600"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <Datepicker
          language="es-MX"
          value={startDate}
          onChange={(d) => d && setStartDate(d)}
        />
        <span className="text-slate-500">a</span>
        <Datepicker
          language="es-MX"
          value={endDate}
          onChange={(d) => d && setEndDate(d)}
        />

        <Button size="sm" onClick={() => refetch()}>
          Actualizar
        </Button>
        <Button size="sm" color="light" onClick={handleExport}>
          <HiDownload className="mr-1 h-4 w-4" />
          Excel
        </Button>
        <Button size="sm" color="light" onClick={handleExportPdf}>
          <HiDownload className="mr-1 h-4 w-4" />
          PDF
        </Button>
      </div>

      {/* Branch selector */}
      <BranchMultiSelect
        branches={branches}
        selected={selectedBranchIds}
        onChange={setSelectedBranchIds}
      />

      {/* Product toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveProduct("chicken")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeProduct === "chicken"
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Pollo
        </button>
        <button
          onClick={() => setActiveProduct("eggs")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeProduct === "eggs"
              ? "bg-amber-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Huevo
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : !data ? (
        <div className="py-10 text-center text-slate-500">
          Selecciona un rango de fechas y haz clic en Actualizar
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <SummaryCards data={data} activeProduct={activeProduct} />

          {/* Daily Chart */}
          <div className="rounded-xl bg-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white">
              {activeProduct === "chicken" ? "Pollo" : "Huevo"} - Ventas Diarias
            </h3>
            {activeProduct === "eggs" && (
              <p className="mb-4 text-xs text-slate-500">
                Valores en casilleros
              </p>
            )}
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  content={
                    <CustomTooltip
                      dailySales={data.dailySales}
                      activeProduct={activeProduct}
                    />
                  }
                />
                <Legend />
                {activeBranchNames.map((name) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={BRANCH_COLORS[name] ?? "#999"}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom: Weekly Summary + Branch Comparison */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Weekly Summary */}
            <div className="rounded-xl bg-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white">
                Resumen Semanal
              </h3>
              {activeProduct === "eggs" && (
                <p className="mb-4 text-xs text-slate-500">
                  Valores en casilleros
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-slate-400">
                      <th className="pb-2 font-medium">Semana</th>
                      {activeBranchNames.slice(0, 5).map((name) => (
                        <th key={name} className="pb-2 text-right font-medium">
                          {name.length > 8 ? name.slice(0, 8) + "." : name}
                        </th>
                      ))}
                      <th className="pb-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weeklySummary.map((week) => {
                      const source =
                        activeProduct === "chicken"
                          ? week.chickenByBranch
                          : week.eggsByBranch;
                      const total =
                        activeProduct === "chicken"
                          ? week.totalChicken
                          : week.totalEggs;

                      return (
                        <tr
                          key={week.weekLabel}
                          className={`cursor-pointer border-b border-slate-700/40 ${
                            selectedWeek === week.weekLabel
                              ? "bg-slate-700/50"
                              : "hover:bg-slate-700/30"
                          }`}
                          onClick={() =>
                            setSelectedWeek(
                              selectedWeek === week.weekLabel
                                ? null
                                : week.weekLabel,
                            )
                          }
                        >
                          <td className="py-2 font-medium text-slate-300">
                            {week.weekLabel}
                          </td>
                          {activeBranchNames.slice(0, 5).map((name) => {
                            const val = source[name] ?? 0;
                            const pct =
                              total > 0
                                ? ((val / total) * 100).toFixed(1)
                                : "0";
                            return (
                              <td
                                key={name}
                                className="py-2 text-right text-slate-400"
                              >
                                {val}
                                <span className="ml-1 text-[10px] text-slate-600">
                                  ({pct}%)
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-2 text-right font-semibold text-white">
                            {total}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Expanded weekly detail */}
              {selectedWeek && (
                <WeeklyDetail
                  week={
                    data.weeklySummary.find(
                      (w) => w.weekLabel === selectedWeek,
                    )!
                  }
                  activeProduct={activeProduct}
                  weeklySummary={data.weeklySummary}
                  selectedWeek={selectedWeek}
                />
              )}
            </div>

            {/* Branch Comparison */}
            <BranchComparisonPanel
              data={data}
              activeProduct={activeProduct}
              selectedBranchIds={selectedBranchIds}
              hoveredBranch={hoveredBranch}
              setHoveredBranch={setHoveredBranch}
            />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCards({
  data,
  activeProduct,
}: {
  data: SalesAnalyticsDTO;
  activeProduct: "chicken" | "eggs";
}) {
  const { summary, branchGrowth } = data;
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const productTotal =
    activeProduct === "chicken" ? summary.totalChicken : summary.totalEggs;
  const productGrowth =
    activeProduct === "chicken" ? summary.chickenGrowth : summary.eggsGrowth;
  const productAvg =
    activeProduct === "chicken"
      ? summary.avgDailyChicken
      : summary.avgDailyEggs;

  const topBranch = [...branchGrowth].sort((a, b) => {
    const aVal = activeProduct === "chicken" ? a.currentChicken : a.currentEggs;
    const bVal = activeProduct === "chicken" ? b.currentChicken : b.currentEggs;
    return bVal - aVal;
  })[0];

  const topBranchPct =
    productTotal > 0 && topBranch
      ? (
          ((activeProduct === "chicken"
            ? topBranch.currentChicken
            : topBranch.currentEggs) /
            productTotal) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        className="relative rounded-xl bg-slate-800 p-4"
        onMouseEnter={() => setHoveredCard("total")}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="text-xs text-slate-400">
          Total {activeProduct === "chicken" ? "Pollo" : "Huevo"}
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {activeProduct === "eggs"
            ? productTotal.toLocaleString()
            : productTotal.toLocaleString()}
        </div>
        <div
          className={`mt-1 text-xs font-semibold ${getGrowthColor(productGrowth)}`}
        >
          {getGrowthArrow(productGrowth)} {productGrowth > 0 ? "+" : ""}
          {productGrowth}% vs mes ant.
        </div>
        {hoveredCard === "total" && topBranch && (
          <div className="absolute top-full left-0 z-10 mt-1 w-56 rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl">
            <div className="text-[11px] text-slate-400">
              Top sucursal:{" "}
              <span className="font-medium text-slate-200">
                {topBranch.branchName}
              </span>{" "}
              ({topBranchPct}%)
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Prom. diario:{" "}
              <span className="font-medium text-slate-200">{productAvg}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Periodo: {summary.daysInRange} dias
            </div>
          </div>
        )}
      </div>

      <div
        className="relative rounded-xl bg-slate-800 p-4"
        onMouseEnter={() => setHoveredCard("other")}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="text-xs text-slate-400">
          Total {activeProduct === "chicken" ? "Huevo" : "Pollo"}
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {activeProduct === "chicken"
            ? summary.totalEggs.toLocaleString()
            : summary.totalChicken.toLocaleString()}
        </div>
        <div
          className={`mt-1 text-xs font-semibold ${getGrowthColor(
            activeProduct === "chicken"
              ? summary.eggsGrowth
              : summary.chickenGrowth,
          )}`}
        >
          {getGrowthArrow(
            activeProduct === "chicken"
              ? summary.eggsGrowth
              : summary.chickenGrowth,
          )}{" "}
          {(activeProduct === "chicken"
            ? summary.eggsGrowth
            : summary.chickenGrowth) > 0
            ? "+"
            : ""}
          {activeProduct === "chicken"
            ? summary.eggsGrowth
            : summary.chickenGrowth}
          % vs mes ant.
        </div>
      </div>

      <div className="rounded-xl bg-slate-800 p-4">
        <div className="text-xs text-slate-400">
          Promedio Diario {activeProduct === "chicken" ? "Pollo" : "Huevo"}
        </div>
        <div className="mt-1 text-2xl font-bold text-white">
          {activeProduct === "eggs"
            ? productAvg.toLocaleString()
            : productAvg.toLocaleString()}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {summary.daysInRange} dias
        </div>
      </div>

      <div className="rounded-xl bg-slate-800 p-4">
        <div className="text-xs text-slate-400">Sucursales con datos</div>
        <div className="mt-1 text-2xl font-bold text-white">
          {branchGrowth.length}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          de {branchGrowth.length} configuradas
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  dailySales,
  activeProduct,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  dailySales: DailySalesDTO[];
  activeProduct: "chicken" | "eggs";
}) {
  if (!active || !payload || !label) return null;

  const currentDay = dailySales.find((d) => {
    const dateStr = new Date(d.date + "T00:00:00").toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
    return dateStr === label;
  });

  const currentIdx = dailySales.findIndex((d) => {
    const dateStr = new Date(d.date + "T00:00:00").toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
    return dateStr === label;
  });

  const prevDay = currentIdx > 0 ? dailySales[currentIdx - 1] : null;
  const prevWeek = currentIdx >= 7 ? dailySales[currentIdx - 7] : null;

  const total = currentDay
    ? activeProduct === "chicken"
      ? currentDay.totalChicken
      : currentDay.totalEggs
    : 0;

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl">
      <div className="mb-2 text-xs font-semibold text-slate-300">
        {currentDay ? formatDayName(currentDay.date) : ""} {label}
      </div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const branchDaily = currentDay
            ? activeProduct === "chicken"
              ? currentDay.chickenByBranch
              : currentDay.eggsByBranch
            : {};
          const prevBranchDaily = prevDay
            ? activeProduct === "chicken"
              ? prevDay.chickenByBranch
              : prevDay.eggsByBranch
            : {};
          const prevWeekBranchDaily = prevWeek
            ? activeProduct === "chicken"
              ? prevWeek.chickenByBranch
              : prevWeek.eggsByBranch
            : {};

          const currentVal = branchDaily[entry.name] ?? 0;
          const prevDayVal = prevBranchDaily[entry.name] ?? 0;
          const prevWeekVal = prevWeekBranchDaily[entry.name] ?? 0;

          const dayChange =
            prevDayVal > 0 ? ((currentVal - prevDayVal) / prevDayVal) * 100 : 0;
          const weekChange =
            prevWeekVal > 0
              ? ((currentVal - prevWeekVal) / prevWeekVal) * 100
              : 0;

          return (
            <div
              key={entry.name}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: BRANCH_COLORS[entry.name] ?? "#999",
                  }}
                />
                <span className="text-[11px] text-slate-300">{entry.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-medium text-slate-200">
                  {activeProduct === "eggs"
                    ? entry.value.toLocaleString()
                    : entry.value}
                </span>
                {prevDayVal > 0 && (
                  <span
                    className={`ml-1 text-[10px] ${
                      dayChange >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {dayChange >= 0 ? "+" : ""}
                    {dayChange.toFixed(0)}% ayer
                  </span>
                )}
                {prevWeekVal > 0 && (
                  <span
                    className={`ml-1 text-[10px] ${
                      weekChange >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {weekChange >= 0 ? "+" : ""}
                    {weekChange.toFixed(0)}% sem
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 border-t border-slate-600 pt-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Total</span>
          <span className="font-semibold text-white">
            {activeProduct === "eggs" ? total.toLocaleString() : total}
          </span>
        </div>
      </div>
    </div>
  );
}

function WeeklyDetail({
  week,
  activeProduct,
  weeklySummary,
  selectedWeek,
}: {
  week: import("../types").WeeklySummaryDTO;
  activeProduct: "chicken" | "eggs";
  weeklySummary: import("../types").WeeklySummaryDTO[];
  selectedWeek: string;
}) {
  if (!week) return null;

  const source =
    activeProduct === "chicken" ? week.chickenByBranch : week.eggsByBranch;
  const total =
    activeProduct === "chicken" ? week.totalChicken : week.totalEggs;

  const weekIdx = weeklySummary.findIndex((w) => w.weekLabel === selectedWeek);
  const prevWeek = weekIdx > 0 ? weeklySummary[weekIdx - 1] : null;
  const prevTotal = prevWeek
    ? activeProduct === "chicken"
      ? prevWeek.totalChicken
      : prevWeek.totalEggs
    : 0;
  const weekGrowth =
    prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

  return (
    <div className="mt-2 max-h-[300px] overflow-y-auto rounded-lg bg-slate-700/50 p-3">
      <div className="mb-2 text-xs font-semibold text-slate-300">
        Detalle: {selectedWeek}
      </div>
      <div className="space-y-1">
        {Object.entries(source)
          .sort(([, a], [, b]) => b - a)
          .map(([name, qty]) => {
            const pct = total > 0 ? ((qty / total) * 100).toFixed(1) : "0";
            return (
              <div
                key={name}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="text-slate-400">{name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200">
                    {activeProduct === "eggs" ? qty.toLocaleString() : qty}
                  </span>
                  <span className="text-slate-500">({pct}%)</span>
                </div>
              </div>
            );
          })}
      </div>
      <div className="mt-2 border-t border-slate-600 pt-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Total</span>
          <span className="font-semibold text-white">{total}</span>
        </div>
        {prevTotal > 0 && (
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">vs semana anterior</span>
            <span
              className={`font-semibold ${
                weekGrowth >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {weekGrowth >= 0 ? "+" : ""}
              {weekGrowth.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function BranchComparisonPanel({
  data,
  activeProduct,
  selectedBranchIds,
  hoveredBranch,
  setHoveredBranch,
}: {
  data: SalesAnalyticsDTO;
  activeProduct: "chicken" | "eggs";
  selectedBranchIds: number[];
  hoveredBranch: number | null;
  setHoveredBranch: (id: number | null) => void;
}) {
  const { summary } = data;

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Comparacion por Sucursal
      </h3>
      <div className="space-y-3">
        {data.branchGrowth
          .filter((b) => selectedBranchIds.includes(b.branchId))
          .sort((a, b) => {
            const aVal =
              activeProduct === "chicken" ? a.currentChicken : a.currentEggs;
            const bVal =
              activeProduct === "chicken" ? b.currentChicken : b.currentEggs;
            return bVal - aVal;
          })
          .map((branch) => {
            const current =
              activeProduct === "chicken"
                ? branch.currentChicken
                : branch.currentEggs;
            const growth =
              activeProduct === "chicken"
                ? branch.chickenGrowth
                : branch.eggsGrowth;
            const maxVal = Math.max(
              ...data.branchGrowth.map((b) =>
                activeProduct === "chicken" ? b.currentChicken : b.currentEggs,
              ),
              1,
            );
            const barWidth = (current / maxVal) * 100;
            const totalAll =
              activeProduct === "chicken"
                ? summary.totalChicken
                : summary.totalEggs;
            const contribution =
              totalAll > 0 ? ((current / totalAll) * 100).toFixed(1) : "0";
            const dailyAvg =
              summary.daysInRange > 0 ? current / summary.daysInRange : 0;
            const dailyAvgFormatted =
              dailyAvg === Math.floor(dailyAvg)
                ? dailyAvg.toString()
                : dailyAvg.toFixed(1);

            return (
              <div
                key={branch.branchId}
                className="relative"
                onMouseEnter={() => setHoveredBranch(branch.branchId)}
                onMouseLeave={() => setHoveredBranch(null)}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    {branch.branchName}
                  </span>
                  <span
                    className={`text-xs font-semibold ${getGrowthColor(growth)}`}
                  >
                    {getGrowthArrow(growth)} {growth > 0 ? "+" : ""}
                    {growth}% vs mes ant.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 flex-1 overflow-hidden rounded bg-slate-700">
                    <div
                      className="h-full rounded bg-blue-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs font-medium text-slate-400">
                    {current}
                  </span>
                </div>

                {hoveredBranch === branch.branchId && (
                  <div className="absolute bottom-full left-0 z-20 mb-1 w-60 rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl">
                    <div className="mb-2 border-b border-slate-600 pb-1.5 text-[10px] text-slate-500">
                      Comparado con las mismas fechas del mes anterior
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pollo:</span>
                        <span className="font-medium text-slate-200">
                          {branch.previousChicken} → {branch.currentChicken}
                          <span
                            className={`ml-1 ${getGrowthColor(branch.chickenGrowth)}`}
                          >
                            ({branch.chickenGrowth > 0 ? "+" : ""}
                            {branch.chickenGrowth}%)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Huevo:</span>
                        <span className="font-medium text-slate-200">
                          {branch.previousEggs.toLocaleString()} →{" "}
                          {branch.currentEggs.toLocaleString()}
                          <span
                            className={`ml-1 ${getGrowthColor(branch.eggsGrowth)}`}
                          >
                            ({branch.eggsGrowth > 0 ? "+" : ""}
                            {branch.eggsGrowth}%)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Prom. diario:</span>
                        <span className="font-medium text-slate-200">
                          {dailyAvgFormatted}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contribucion:</span>
                        <span className="font-medium text-slate-200">
                          {contribution}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
