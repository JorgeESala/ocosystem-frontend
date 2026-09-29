import { useMemo, useState } from "react";
import { Alert, Button, Card } from "flowbite-react";
import {
  HiArrowLeft,
  HiChartBar,
  HiCurrencyDollar,
  HiDownload,
  HiLightningBolt,
  HiTrash,
  HiTrendingUp,
  HiX,
} from "react-icons/hi";
import * as XLSX from "xlsx";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useSalesReport } from "../api/salesReportes.queries";
import { ProductSalesTable } from "./ProductSalesTable";
import DateRangePicker from "@/components/DateRangePicker";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { TopProductsCard } from "./TopProductsCard";
import { StrategyInsights } from "./StrategyInsights";
import { TicketsByWeekdayCard } from "./TicketsByWeekdayCard";
import { CategoryMixCard } from "./CategoryMixCard";
import { KPICard } from "./KPICard";
import { InfoTip } from "@/components/InfoTip";
import { ProductDetailDrawer } from "./ProductDetailDrawer";
import { ProductPerformanceCard } from "./ProductPerformanceCard";
import { TopCategoryToggles } from "./TopCategoryToggles";
import { useProductAnalytics } from "../api/productAnalytics.queries";
import {
  formatDateRange,
  formatFullDate,
  formatWeekdayDayMonth,
  toLocalDateString,
} from "@/utils/date.utils";
import { formatMXNCompact } from "@/utils/moneyNumbers";
import { formatUnits } from "../utils/productMetrics";
import { ticketsByWeekday, peakWeekday } from "../utils/ticketsByWeekday";
import { deltaPct } from "../utils/consolidatedMetrics";
import {
  filterTopProducts,
  useTopCategoryFilters,
} from "../utils/topCategoryFilters";
import { scrollToSection } from "../utils/scrollToSection";
import {
  analyticsProductsSheet,
  appendSheet,
  categorySalesSheet,
  dailySalesSheet,
  salesProductsSheet,
} from "../utils/reportExcel";

interface Props {
  branchId: number;
  branchName?: string;
  dates: { start: Date; end: Date };
  onDatesChange: (start: Date, end: Date) => void;
  onBack: () => void;
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayDiff = (start: Date, end: Date) =>
  Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000,
  );

export const SalesDashboard = ({
  branchId,
  branchName,
  dates,
  onDatesChange,
  onBack,
}: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [detailBarcode, setDetailBarcode] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { hideChicken, hideEgg, setHideChicken, setHideEgg } =
    useTopCategoryFilters();

  const previousRange = useMemo(() => {
    const days = dayDiff(dates.start, dates.end) + 1;
    const end = new Date(dates.start);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    return { start, end };
  }, [dates]);

  const { data, isLoading, isError } = useSalesReport(
    branchId,
    dates.start,
    dates.end,
  );
  const { data: previousData } = useSalesReport(
    branchId,
    previousRange.start,
    previousRange.end,
  );
  const { data: performanceData } = useProductAnalytics(
    [branchId],
    dates.start,
    dates.end,
    { limit: 15, excludeChicken: hideChicken, excludeEgg: hideEgg },
  );

  const handleDateChange = (start: Date | null, end: Date | null) => {
    if (start && end) {
      onDatesChange(start, end);
    }
  };

  const processedData = useMemo(() => {
    if (!data) return null;

    const { products, categories, summary, dailySales: dailySeries } = data;

    const attachRate =
      summary.totalChickenTickets > 0
        ? (summary.ticketsWithComplements / summary.totalChickenTickets) * 100
        : 0;

    const topAffinityProduct = [...products]
      .filter(
        (p) =>
          p.categoryName !== "Pollo" &&
          p.categoryName !== "Merma" &&
          p.categoryName !== "Matados",
      )
      .sort((a, b) => b.attachmentFrequency - a.attachmentFrequency)[0];

    const crossSellGap =
      summary.avgFullTicketValue - summary.avgChickenOnlyTicketValue;

    const ventasReales = products.filter(
      (p) => p.categoryName !== "Matados" && p.categoryName !== "Merma",
    );

    const totalVentaReal = ventasReales.reduce(
      (acc, p) => acc + p.totalSales,
      0,
    );

    const ticketPromedioReal =
      summary.realTickets > 0 ? totalVentaReal / summary.realTickets : 0;

    const totalPerdidaNeta = products
      .filter(
        (p) =>
          p.categoryName === "Merma" &&
          !p.productName.toLowerCase().includes("tripa"),
      )
      .reduce((acc, p) => acc + p.quantitySold, 0);

    const categoriasComerciales = categories.filter(
      (c) => c.categoryName !== "Matados" && c.categoryName !== "Merma",
    );

    const weekdayRows = ticketsByWeekday(
      dailySeries,
      (entry) => entry.realTickets,
    );
    const peak = peakWeekday(weekdayRows);

    return {
      ventasReales,
      totalVentaReal,
      totalPerdidaNeta,
      ticketPromedioReal,
      categoriasComerciales,
      attachRate,
      topAffinity: topAffinityProduct?.productName || "No data",
      crossSellGap: crossSellGap > 0 ? crossSellGap : 0,
      weekdayRows,
      peak,
    };
  }, [data]);

  const deltas = useMemo(() => {
    if (!processedData || !data || !previousData) return null;

    const previousSummary = previousData.summary;
    const previousVentaReal = previousSummary.totalSales;
    const previousTicketPromedio =
      previousSummary.realTickets > 0
        ? previousVentaReal / previousSummary.realTickets
        : 0;
    const previousPerdidaNeta = previousData.products
      .filter(
        (p) =>
          p.categoryName === "Merma" &&
          !p.productName.toLowerCase().includes("tripa"),
      )
      .reduce((acc, p) => acc + p.quantitySold, 0);

    const currentDays = data.dailySales.length;
    const previousDays = previousData.dailySales.length;

    return {
      totalVenta: deltaPct(processedData.totalVentaReal, previousVentaReal),
      ticketPromedio: deltaPct(
        processedData.ticketPromedioReal,
        previousTicketPromedio,
      ),
      slaughter: deltaPct(
        data.summary.totalSlaughtered,
        previousSummary.totalSlaughtered,
      ),
      dailySlaughtered: deltaPct(
        currentDays > 0 ? data.summary.totalSlaughtered / currentDays : 0,
        previousDays > 0 ? previousSummary.totalSlaughtered / previousDays : 0,
      ),
      perdida: deltaPct(processedData.totalPerdidaNeta, previousPerdidaNeta),
    };
  }, [processedData, data, previousData]);

  const summary = data?.summary;
  const products = useMemo(() => data?.products ?? [], [data]);
  const categories = data?.categories || [];
  const dailySales = data?.dailySales || [];

  const tableProducts = useMemo(
    () =>
      selectedCategory
        ? products.filter((p) => p.categoryName === selectedCategory)
        : products,
    [products, selectedCategory],
  );

  const visibleTopProducts = useMemo(() => {
    if (!processedData) return [];
    const filtered = filterTopProducts(
      processedData.ventasReales,
      hideChicken,
      hideEgg,
    );
    return [...filtered]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
      .map((product) => ({
        ...product,
        participation:
          (product.totalSales / processedData.totalVentaReal || 1) * 100,
      }));
  }, [processedData, hideChicken, hideEgg]);

  const dailySlaughteredAvg = useMemo(() => {
    const total = summary?.totalSlaughtered || 0;
    const diasConVentas = data?.dailySales?.length || 0;
    return diasConVentas > 0 ? total / diasConVentas : 0;
  }, [summary, data]);

  const totalMermaQuantity = useMemo(
    () =>
      products
        .filter((product) => product.categoryName === "Merma")
        .reduce((acc, product) => acc + product.quantitySold, 0),
    [products],
  );

  const handleExport = async () => {
    if (!data || !processedData) return;

    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      const previousSummary = previousData?.summary;
      const currentDailyAvg =
        data.dailySales.length > 0
          ? data.summary.totalSlaughtered / data.dailySales.length
          : 0;
      const previousDailyAvg =
        previousData && previousData.dailySales.length > 0
          ? (previousSummary?.totalSlaughtered ?? 0) /
            previousData.dailySales.length
          : 0;
      const previousTicket =
        previousSummary && previousSummary.realTickets > 0
          ? previousSummary.totalSales / previousSummary.realTickets
          : 0;
      const previousLoss =
        previousData?.products
          .filter(
            (product) =>
              product.categoryName === "Merma" &&
              !product.productName.toLowerCase().includes("tripa"),
          )
          .reduce((acc, product) => acc + product.quantitySold, 0) ?? 0;

      const roundDelta = (value: number | null | undefined) =>
        value == null ? "" : Number(value.toFixed(2));

      appendSheet(wb, {
        name: "Resumen",
        rows: [
          ["Reporte de sucursal"],
          ["Sucursal", branchName ?? `Sucursal ${branchId}`],
          ["Periodo", formatDateRange(dates.start, dates.end)],
          [""],
          ["Indicador", "Periodo", "Anterior", "Cambio %"],
          [
            "Venta real",
            processedData.totalVentaReal,
            previousSummary?.totalSales ?? "",
            roundDelta(deltas?.totalVenta),
          ],
          [
            "Pollo beneficiado (pzas)",
            data.summary.totalSlaughtered,
            previousSummary?.totalSlaughtered ?? "",
            roundDelta(deltas?.slaughter),
          ],
          [
            "Promedio beneficiado (pzas/día)",
            currentDailyAvg,
            previousDailyAvg,
            roundDelta(deltas?.dailySlaughtered),
          ],
          [
            "Ticket promedio",
            processedData.ticketPromedioReal,
            previousTicket,
            roundDelta(deltas?.ticketPromedio),
          ],
          [
            "Pérdida neta (merma)",
            processedData.totalPerdidaNeta,
            previousLoss,
            roundDelta(deltas?.perdida),
          ],
        ],
        cols: [{ wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 12 }],
      });

      appendSheet(wb, dailySalesSheet(data.dailySales));
      appendSheet(wb, categorySalesSheet(data.categories));
      appendSheet(wb, salesProductsSheet(data.products));

      if (performanceData && performanceData.products.length > 0) {
        appendSheet(
          wb,
          analyticsProductsSheet(
            "Rendimiento Top 15",
            performanceData.products,
          ),
        );
      }

      const branchFileLabel = branchName
        ? branchName.replace(/\s+/g, "-").toLowerCase()
        : `sucursal-${branchId}`;

      XLSX.writeFile(
        wb,
        `reporte-${branchFileLabel}-${toLocalDateString(dates.start)}_${toLocalDateString(dates.end)}.xlsx`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Button color="gray" size="sm" onClick={onBack}>
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Consolidado
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {branchName ?? `Sucursal #${branchId}`}
            </h1>
            <p className="text-gray-400">
              Análisis de rendimiento, producción y control de mermas.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            startDate={new Date(dates.start)}
            endDate={new Date(dates.end)}
            onChange={handleDateChange}
          />
          <Button
            color="gray"
            size="sm"
            onClick={() => void handleExport()}
            disabled={isExporting}
          >
            <HiDownload className="mr-2 h-4 w-4" />
            {isExporting ? "Exportando..." : "Exportar Excel"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError || !processedData ? (
        <Alert color="failure">
          Ocurrió un error al cargar los datos estratégicos.
        </Alert>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <KPICard
              title="Pollo Beneficiado"
              value={`${formatUnits(summary?.totalSlaughtered ?? 0)} pzas`}
              color="pink"
              icon={HiLightningBolt}
              delta={deltas?.slaughter}
              info={
                <InfoTip title="Pollo Beneficiado">
                  Piezas registradas en la categoría Matados.
                </InfoTip>
              }
            />

            <KPICard
              title="Promedio Beneficiado"
              value={`${formatUnits(dailySlaughteredAvg)} pzas/día`}
              color="orange"
              icon={HiChartBar}
              delta={deltas?.dailySlaughtered}
              info={
                <InfoTip title="Promedio Beneficiado">
                  Pollo beneficiado entre los días con reporte del periodo.
                </InfoTip>
              }
            />

            <KPICard
              title="Venta Real"
              value={formatMXNCompact(processedData.totalVentaReal)}
              color="blue"
              icon={HiCurrencyDollar}
              delta={deltas?.totalVenta}
              info={
                <InfoTip title="Venta Real">
                  Ventas al público sin Merma ni Matados. Las cancelaciones ya
                  están restadas.
                </InfoTip>
              }
            />

            <KPICard
              title="Ticket Promedio"
              value={formatMXNCompact(processedData.ticketPromedioReal)}
              color="green"
              icon={HiTrendingUp}
              delta={deltas?.ticketPromedio}
              info={
                <InfoTip title="Ticket Promedio">
                  Venta Real entre los tickets reales del periodo.
                </InfoTip>
              }
            />

            <KPICard
              title="Pérdida Neta (Merma)"
              value={formatUnits(processedData.totalPerdidaNeta)}
              color="red"
              icon={HiTrash}
              delta={deltas?.perdida}
              deltaInvert
              footnote={`Merma total (incluye tripa): ${formatUnits(totalMermaQuantity)}`}
              onClick={() => {
                setSelectedCategory("Merma");
                scrollToSection("product-table-section");
              }}
              actionHint="Ver detalle"
              info={
                <InfoTip title="Pérdida Neta (Merma)">
                  Pérdida neta = merma sin tripa (lo que realmente se pierde).
                  La tripa es merma operativa. Merma total = pérdida neta +
                  tripa. Haz clic para filtrar la tabla de productos.
                </InfoTip>
              }
            />
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="flex flex-col gap-6 xl:col-span-8">
              <Card className="h-full border-none bg-gray-800 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-200">
                  Tendencia de Ingresos Reales
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySales}>
                      <defs>
                        <linearGradient
                          id="colorSales"
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
                        tickFormatter={(val) => `$${val / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                        labelFormatter={(value) => formatFullDate(value)}
                        formatter={(val: number) => [
                          `$${val.toLocaleString()}`,
                          "Venta Real",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="totalSales"
                        stroke="#3B82F6"
                        fill="url(#colorSales)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StrategyInsights
                  attachRate={processedData.attachRate}
                  topAffinity={processedData.topAffinity}
                  crossSellGap={processedData.crossSellGap}
                />
                <TicketsByWeekdayCard
                  rows={processedData.weekdayRows}
                  peak={processedData.peak}
                  tickets={summary?.realTickets || 0}
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 xl:col-span-4">
              <TopProductsCard products={visibleTopProducts} />

              <CategoryMixCard
                categories={processedData.categoriasComerciales}
                totalSales={processedData.totalVentaReal}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <TopCategoryToggles
              hideChicken={hideChicken}
              hideEgg={hideEgg}
              onChange={(nextHideChicken, nextHideEgg) => {
                setHideChicken(nextHideChicken);
                setHideEgg(nextHideEgg);
              }}
            />
            <ProductPerformanceCard
              branchId={branchId}
              dates={dates}
              excludeChicken={hideChicken}
              excludeEgg={hideEgg}
              onSelectProduct={(barcode) => setDetailBarcode(barcode)}
            />
            <div id="product-table-section" className="scroll-mt-4 space-y-4">
              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Filtrando por categoría:
                  </span>
                  <Button
                    size="xs"
                    color="gray"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <span className="font-semibold">{selectedCategory}</span>
                    <HiX className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              )}
              <ProductSalesTable
                products={tableProducts}
                categories={categories}
              />
            </div>
          </div>

          <ProductDetailDrawer
            open={detailBarcode !== null}
            onClose={() => setDetailBarcode(null)}
            barcode={detailBarcode}
            branchIds={[branchId]}
            dates={dates}
          />
        </>
      )}
    </div>
  );
};
