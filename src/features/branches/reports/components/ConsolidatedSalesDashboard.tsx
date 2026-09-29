import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Button, Card } from "flowbite-react";
import {
  HiCurrencyDollar,
  HiDownload,
  HiLightningBolt,
  HiOutlineOfficeBuilding,
  HiQuestionMarkCircle,
  HiTrash,
  HiTrendingUp,
} from "react-icons/hi";
import * as XLSX from "xlsx";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReportBranches } from "@/features/branches/branch/reportBranches.queries";
import { useConsolidatedSalesReport } from "../api/consolidatedSales.queries";
import { fetchProductAnalytics } from "../api/productAnalytics.api";
import { useProductAnalytics } from "../api/productAnalytics.queries";
import {
  analyticsProductsSheet,
  appendSheet,
  categorySalesSheet,
  dailySalesSheet,
  fetchAllProductAnalytics,
} from "../utils/reportExcel";
import { formatMXN, formatMXNCompact } from "@/utils/moneyNumbers";
import {
  formatDateRange,
  formatFullDate,
  formatWeekdayDayMonth,
  toLocalDateString,
} from "@/utils/date.utils";
import DateRangePicker from "@/components/DateRangePicker";
import ExcludedBranchesNote from "@/components/ExcludedBranchesNote";
import { InfoTip } from "@/components/InfoTip";
import { BranchScopeSelect } from "./BranchScopeSelect";
import { BranchRankingTable, type RankingSort } from "./BranchRankingTable";
import { CategoryMixCard } from "./CategoryMixCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DataCompletenessBanner } from "./DataCompletenessBanner";
import { KPICard } from "./KPICard";
import { ProductAnalyticsSection } from "./ProductAnalyticsSection";
import type { MatrixMetric } from "./ProductBranchMatrix";
import { ProductDetailDrawer } from "./ProductDetailDrawer";
import { TicketsByWeekdayCard } from "./TicketsByWeekdayCard";
import { WasteDetailDrawer } from "./WasteDetailDrawer";
import { TopProductsCard } from "./TopProductsCard";
import {
  buildRankingRows,
  deltaPct,
  expectedReportDays,
} from "../utils/consolidatedMetrics";
import { peakWeekday, ticketsByWeekday } from "../utils/ticketsByWeekday";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import { useTopCategoryFilters } from "../utils/topCategoryFilters";
import { scrollToSection } from "../utils/scrollToSection";

const PRESET_DAYS = [7, 14, 30, 90];
const CATALOG_PAGE_SIZE = 10;

const formatNumber = (value: number) =>
  value.toLocaleString("es-MX", { maximumFractionDigits: 1 });

interface Props {
  dates: { start: Date; end: Date };
  onDatesChange: (start: Date, end: Date) => void;
  selectedBranchIds: number[];
  onSelectedBranchIdsChange: (ids: number[]) => void;
  onSelectBranch: (branchId: number, branchName: string) => void;
}

export const ConsolidatedSalesDashboard = ({
  dates,
  onDatesChange,
  selectedBranchIds,
  onSelectedBranchIdsChange,
  onSelectBranch,
}: Props) => {
  const { slug } = useParams();
  const {
    branches,
    excluded,
    isLoading: branchesLoading,
  } = useReportBranches();

  const effectiveBranchIds = useMemo(() => {
    const excludedIds = new Set(excluded.map((item) => item.branchId));
    const scope =
      selectedBranchIds.length > 0
        ? selectedBranchIds
        : branches.map((branch) => branch.id);
    return scope.filter((id) => !excludedIds.has(id));
  }, [selectedBranchIds, branches, excluded]);

  const [metric, setMetric] = useState<MatrixMetric>("sales");
  const [searchInput, setSearchInput] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [catalogPage, setCatalogPage] = useState(0);
  const [detailBarcode, setDetailBarcode] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [wasteOpen, setWasteOpen] = useState(false);
  const [rankingSort, setRankingSort] = useState<RankingSort>({
    key: "totalSales",
    direction: "desc",
  });
  const { hideChicken, hideEgg, setHideChicken, setHideEgg } =
    useTopCategoryFilters();
  const debouncedSearch = useDebouncedValue(searchInput);

  const { data, isLoading, isError } = useConsolidatedSalesReport(
    effectiveBranchIds,
    dates.start,
    dates.end,
  );

  const { data: topProductsData, isLoading: topProductsLoading } =
    useProductAnalytics(effectiveBranchIds, dates.start, dates.end, {
      limit: 10,
      sort: "sales",
      excludeChicken: hideChicken,
      excludeEgg: hideEgg,
    });

  const { data: matrixData, isLoading: matrixLoading } = useProductAnalytics(
    effectiveBranchIds,
    dates.start,
    dates.end,
    {
      limit: 10,
      sort: metric,
      categoryId: categoryId ?? undefined,
      excludeChicken: hideChicken,
      excludeEgg: hideEgg,
    },
  );

  const { data: catalogData, isLoading: catalogLoading } = useProductAnalytics(
    effectiveBranchIds,
    dates.start,
    dates.end,
    {
      limit: CATALOG_PAGE_SIZE,
      offset: catalogPage * CATALOG_PAGE_SIZE,
      sort: metric,
      search: debouncedSearch,
      categoryId: categoryId ?? undefined,
      excludeChicken: hideChicken,
      excludeEgg: hideEgg,
    },
  );

  useEffect(() => {
    setCatalogPage(0);
  }, [debouncedSearch, categoryId, metric, hideChicken, hideEgg]);

  const expectedDays = useMemo(
    () => expectedReportDays(dates.start, dates.end),
    [dates],
  );

  const rankingRows = useMemo(
    () =>
      data
        ? buildRankingRows(
            data.branchSummary,
            data.previousBranchSummary,
            expectedDays,
          )
        : [],
    [data, expectedDays],
  );

  const categoryOptions = useMemo(
    () =>
      (data?.categories ?? [])
        .filter(
          (category) =>
            category.categoryName !== "Merma" &&
            category.categoryName !== "Matados",
        )
        .map((category) => ({
          id: category.categoryId,
          name: category.categoryName,
        })),
    [data],
  );

  const summary = data?.summary;
  const previousSummary = data?.previousSummary ?? null;

  const deltas = useMemo(
    () => ({
      totalSales: deltaPct(
        summary?.totalSales ?? 0,
        previousSummary?.totalSales,
      ),
      totalSlaughtered: deltaPct(
        summary?.totalSlaughtered ?? 0,
        previousSummary?.totalSlaughtered,
      ),
      avgTicket: deltaPct(summary?.avgTicket ?? 0, previousSummary?.avgTicket),
      mermaLossQuantity: deltaPct(
        summary?.mermaLossQuantity ?? 0,
        previousSummary?.mermaLossQuantity,
      ),
      attachRate: deltaPct(
        summary?.attachRate ?? 0,
        previousSummary?.attachRate,
      ),
    }),
    [summary, previousSummary],
  );

  const topProducts = useMemo(() => {
    if (!summary) return [];
    return (topProductsData?.products ?? []).slice(0, 5).map((product) => ({
      productBarcode: product.productBarcode,
      productName: product.productName,
      quantitySold: product.quantity,
      totalSales: product.sales,
      unitName: product.unitName,
      participation:
        summary.totalSales > 0 ? (product.sales / summary.totalSales) * 100 : 0,
    }));
  }, [topProductsData, summary]);

  const weekdayRows = useMemo(
    () =>
      ticketsByWeekday(data?.dailySales ?? [], (entry) => entry.realTickets),
    [data],
  );
  const peak = useMemo(() => peakWeekday(weekdayRows), [weekdayRows]);

  const scopeLabel = useMemo(() => {
    if (selectedBranchIds.length === 0) return "Todas las sucursales";
    if (selectedBranchIds.length === 1) {
      return (
        branches.find((branch) => branch.id === selectedBranchIds[0])?.name ??
        "1 sucursal"
      );
    }
    return `${selectedBranchIds.length} sucursales`;
  }, [selectedBranchIds, branches]);

  const reportingCount = rankingRows.filter(
    (row) => row.daysWithReport > 0,
  ).length;
  const partialCount = rankingRows.filter(
    (row) => row.daysWithReport > 0 && row.missingDays > 0,
  ).length;

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
    onDatesChange(start, end);
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    if (start && end) onDatesChange(start, end);
  };

  const handleExport = async () => {
    if (!data || !summary) return;

    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      appendSheet(wb, {
        name: "Resumen",
        rows: [
          ["Reporte consolidado de sucursales"],
          [""],
          ["Periodo", formatDateRange(dates.start, dates.end)],
          ["Sucursales incluidas", effectiveBranchIds.length],
          [""],
          ["Venta real", summary.totalSales],
          ["Pollo beneficiado (pzas)", summary.totalSlaughtered],
          ["Ticket promedio", summary.avgTicket],
          ["Pérdida neta (merma)", summary.mermaLossQuantity],
          ["Merma total", summary.mermaQuantity],
          ["Valor de merma", summary.mermaValue],
          ["Ticket promedio con complemento", summary.avgFullTicketValue],
          ["Tickets con complemento (%)", summary.attachRate],
          [""],
          ["Cambio vs. periodo anterior (%)"],
          ["Venta real", deltas.totalSales ?? ""],
          ["Pollo beneficiado", deltas.totalSlaughtered ?? ""],
          ["Ticket promedio", deltas.avgTicket ?? ""],
          ["Pérdida neta (merma)", deltas.mermaLossQuantity ?? ""],
          ["Tickets con complemento", deltas.attachRate ?? ""],
        ],
        cols: [{ wch: 34 }, { wch: 22 }],
      });

      appendSheet(wb, {
        name: "Sucursales",
        rows: [
          [
            "Sucursal",
            "Venta real",
            "Participación %",
            "vs. anterior %",
            "Ticket promedio",
            "Pollo beneficiado",
            "Merma",
            "Valor merma",
            "Días con reporte",
            "Días faltantes",
          ],
          ...rankingRows.map((row) => [
            row.branchName,
            row.totalSales,
            Number(row.share.toFixed(2)),
            row.salesDelta == null ? "" : Number(row.salesDelta.toFixed(2)),
            row.avgTicket,
            row.totalSlaughtered,
            row.mermaQuantity,
            row.mermaValue,
            row.daysWithReport,
            row.missingDays,
          ]),
        ],
        cols: [
          { wch: 22 },
          { wch: 14 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 16 },
          { wch: 12 },
          { wch: 12 },
          { wch: 15 },
          { wch: 13 },
        ],
      });

      appendSheet(wb, dailySalesSheet(data.dailySales));
      appendSheet(wb, categorySalesSheet(data.categories));

      if (topProductsData && topProductsData.products.length > 0) {
        appendSheet(
          wb,
          analyticsProductsSheet("Productos Top", topProductsData.products),
        );
      }

      if (matrixData && matrixData.products.length > 0) {
        const branchColumns = rankingRows.map((row) => row.branchName);
        appendSheet(wb, {
          name: "Productos por sucursal",
          rows: [
            ["Producto", "Categoría", "Clase", ...branchColumns, "Total"],
            ...matrixData.products.map((product) => [
              product.productName,
              product.categoryName,
              product.abcClass,
              ...rankingRows.map((row) => {
                const item = product.branchBreakdown.find(
                  (breakdown) => breakdown.branchId === row.branchId,
                );
                if (!item) return 0;
                return metric === "sales" ? item.sales : item.quantity;
              }),
              metric === "sales" ? product.sales : product.quantity,
            ]),
          ],
          cols: [
            { wch: 28 },
            { wch: 16 },
            { wch: 8 },
            ...branchColumns.map(() => ({ wch: 14 })),
            { wch: 14 },
          ],
        });
      }

      const catalogProducts = await fetchAllProductAnalytics((offset, limit) =>
        fetchProductAnalytics(effectiveBranchIds, dates.start, dates.end, {
          limit,
          offset,
          sort: metric,
          categoryId: categoryId ?? undefined,
          excludeChicken: hideChicken,
          excludeEgg: hideEgg,
        }),
      );

      if (catalogProducts.length > 0) {
        appendSheet(wb, analyticsProductsSheet("Catálogo", catalogProducts));
      }

      XLSX.writeFile(
        wb,
        `reporte-sucursales-${toLocalDateString(dates.start)}_${toLocalDateString(dates.end)}.xlsx`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const controls = (
    <div className="flex flex-wrap items-center gap-3">
      <BranchScopeSelect
        branches={branches}
        selected={selectedBranchIds}
        onChange={onSelectedBranchIdsChange}
        disabled={branchesLoading}
      />
      <div className="flex items-center gap-1">
        {PRESET_DAYS.map((days) => (
          <Button
            key={days}
            size="xs"
            color="gray"
            onClick={() => applyPreset(days)}
          >
            {days}D
          </Button>
        ))}
      </div>
      <DateRangePicker
        startDate={dates.start}
        endDate={dates.end}
        onChange={handleDateChange}
      />
      <Button
        color="gray"
        size="sm"
        onClick={() => void handleExport()}
        disabled={!data || isExporting}
      >
        <HiDownload className="mr-2 h-4 w-4" />
        {isExporting ? "Exportando..." : "Exportar Excel"}
      </Button>
      <Link to={`/business/${slug}/reports/help`}>
        <Button color="gray" size="sm">
          <HiQuestionMarkCircle className="mr-2 h-4 w-4" />
          Ayuda
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Panel general: Sucursales
          </h1>
          <p className="text-gray-400">
            Vista consolidada del negocio. Haz clic en una sucursal para ver el
            detalle.
          </p>
          <ExcludedBranchesNote excluded={excluded} className="mt-2" />
        </div>
        {controls}
      </div>

      {branches.length === 0 && !branchesLoading ? (
        <Alert color="info">No hay sucursales disponibles para analizar.</Alert>
      ) : isLoading || branchesLoading ? (
        <DashboardSkeleton />
      ) : isError || !data || !summary ? (
        <Alert color="failure">
          Ocurrió un error al cargar los datos consolidados.
        </Alert>
      ) : (
        <>
          <DataCompletenessBanner
            rows={rankingRows}
            expectedDays={expectedDays}
          />

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <KPICard
              title="Venta Real"
              value={formatMXNCompact(summary.totalSales)}
              color="blue"
              icon={HiCurrencyDollar}
              delta={deltas.totalSales}
              onClick={() => {
                setRankingSort({ key: "totalSales", direction: "desc" });
                scrollToSection("ranking-section");
              }}
              actionHint="Ver ranking"
              info={
                <InfoTip title="Venta Real">
                  Ventas al público del periodo. No incluye Merma ni Matados, y
                  las cancelaciones ya están restadas.
                </InfoTip>
              }
            />
            <KPICard
              title="Pollo Beneficiado"
              value={`${formatNumber(summary.totalSlaughtered)} pzas`}
              color="pink"
              icon={HiLightningBolt}
              delta={deltas.totalSlaughtered}
              onClick={() => {
                setRankingSort({ key: "totalSlaughtered", direction: "desc" });
                scrollToSection("ranking-section");
              }}
              actionHint="Ver ranking"
              info={
                <InfoTip title="Pollo Beneficiado">
                  Piezas registradas en la categoría Matados. Sirve para
                  comparar producción contra venta.
                </InfoTip>
              }
            />
            <KPICard
              title="Ticket Promedio"
              value={formatMXNCompact(summary.avgTicket)}
              color="green"
              icon={HiTrendingUp}
              delta={deltas.avgTicket}
              onClick={() => {
                setRankingSort({ key: "avgTicket", direction: "desc" });
                scrollToSection("ranking-section");
              }}
              actionHint="Ver ranking"
              info={
                <InfoTip title="Ticket Promedio">
                  Venta Real dividida entre los tickets reales (tickets con al
                  menos una venta real).
                </InfoTip>
              }
            />
            <KPICard
              title="Pérdida Neta (Merma)"
              value={formatNumber(summary.mermaLossQuantity)}
              color="red"
              icon={HiTrash}
              delta={deltas.mermaLossQuantity}
              deltaInvert
              footnote={`Merma total (incluye tripa): ${formatNumber(summary.mermaQuantity)}`}
              onClick={() => setWasteOpen(true)}
              actionHint="Ver detalle"
              info={
                <InfoTip title="Pérdida Neta (Merma)">
                  Pérdida neta = merma sin tripa (lo que realmente se pierde).
                  La tripa es merma operativa. Merma total = pérdida neta +
                  tripa. Haz clic para ver el desglose por producto y sucursal.
                </InfoTip>
              }
            />
            <KPICard
              title="Sucursales Reportando"
              value={`${reportingCount}/${rankingRows.length}`}
              color="orange"
              icon={HiOutlineOfficeBuilding}
              footnote={
                partialCount > 0
                  ? `${partialCount} con cobertura parcial`
                  : "Cobertura completa"
              }
              onClick={() => {
                setRankingSort({ key: "daysWithReport", direction: "desc" });
                scrollToSection("ranking-section");
              }}
              actionHint="Ver ranking"
              info={
                <InfoTip title="Sucursales Reportando">
                  Sucursales con al menos un día de reporte. Un día sin reporte
                  no cuenta como venta en cero; revisa el aviso de cobertura.
                </InfoTip>
              }
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <Card className="h-full border-none bg-gray-800 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-200">
                    Tendencia de Ingresos Reales
                  </h3>
                  <span className="text-xs text-gray-500">
                    Tickets con complemento: {summary.attachRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.dailySales}>
                      <defs>
                        <linearGradient
                          id="consolidatedColorSales"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="#9CA3AF"
                        fontSize={11}
                        minTickGap={16}
                        tickFormatter={(value: string) =>
                          formatWeekdayDayMonth(value)
                        }
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value: number) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                        labelFormatter={(value) => formatFullDate(value)}
                        formatter={(value: number) => [
                          formatMXN(value),
                          "Venta Real",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="totalSales"
                        stroke="#3B82F6"
                        fill="url(#consolidatedColorSales)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="xl:col-span-4">
              <TopProductsCard
                products={topProducts}
                isLoading={topProductsLoading}
              />
            </div>
          </div>

          <div className="mb-8 scroll-mt-4" id="ranking-section">
            <BranchRankingTable
              rows={rankingRows}
              expectedDays={expectedDays}
              onSelectBranch={onSelectBranch}
              sort={rankingSort}
              onSortChange={setRankingSort}
            />
          </div>

          <div className="mb-8">
            <ProductAnalyticsSection
              branches={rankingRows.map((row) => ({
                id: row.branchId,
                name: row.branchName,
              }))}
              categoryOptions={categoryOptions}
              metric={metric}
              onMetricChange={setMetric}
              categoryId={categoryId}
              onCategoryChange={setCategoryId}
              hideChicken={hideChicken}
              hideEgg={hideEgg}
              onToggleChange={(nextHideChicken, nextHideEgg) => {
                setHideChicken(nextHideChicken);
                setHideEgg(nextHideEgg);
              }}
              matrixRows={matrixData?.products ?? []}
              matrixLoading={matrixLoading}
              catalogRows={catalogData?.products ?? []}
              catalogTotal={catalogData?.total ?? 0}
              catalogPage={catalogPage}
              catalogPageSize={CATALOG_PAGE_SIZE}
              catalogLoading={catalogLoading}
              catalogSearchValue={searchInput}
              onCatalogSearchChange={setSearchInput}
              onCatalogPageChange={setCatalogPage}
              onSelectProduct={(barcode) => setDetailBarcode(barcode)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CategoryMixCard
              categories={data.categories}
              totalSales={summary.totalSales}
            />
            <TicketsByWeekdayCard
              rows={weekdayRows}
              peak={peak}
              tickets={summary.realTickets}
            />
          </div>

          <WasteDetailDrawer
            open={wasteOpen}
            onClose={() => setWasteOpen(false)}
            branchIds={effectiveBranchIds}
            dates={dates}
            scopeLabel={scopeLabel}
            onSelectProduct={(barcode) => {
              setWasteOpen(false);
              setDetailBarcode(barcode);
            }}
          />

          <ProductDetailDrawer
            open={detailBarcode !== null}
            onClose={() => setDetailBarcode(null)}
            barcode={detailBarcode}
            branchIds={effectiveBranchIds}
            dates={dates}
          />
        </>
      )}
    </div>
  );
};
