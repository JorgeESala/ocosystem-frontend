import { useMemo, useState } from "react";
import { Card, Alert } from "flowbite-react";
import {
  HiTrendingUp,
  HiCurrencyDollar,
  HiLightningBolt,
  HiTrash,
  HiOutlineOfficeBuilding,
  HiChartBar,
} from "react-icons/hi";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useSalesReport } from "../api/salesReportes.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { ProductSalesTable } from "./ProductSalesTable";
import DateRangePicker from "@/components/DateRangePicker";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { TopProductsCard } from "./TopProductsCard";
import { StrategyInsights } from "./StrategyInsights";
import { TicketsByWeekdayCard } from "./TicketsByWeekdayCard";
import { BranchSelect } from "@/components/BranchSelect";
import { KPICard } from "./KPICard";
import { formatFullDate } from "@/utils/date.utils";
import { ticketsByWeekday, peakWeekday } from "../utils/ticketsByWeekday";

// Colores para el tema oscuro de la empresa
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

export const SalesDashboard = () => {
  const [dates, setDates] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [selectedBranch, setSelectedBranch] = useState<number | "">("");
  // 2. Queries de TanStack
  const { data, isLoading, isError } = useSalesReport(
    selectedBranch,
    dates.start,
    dates.end,
  );

  const handleDateChange = (start: Date | null, end: Date | null) => {
    if (start && end) {
      setDates({
        start: start,
        end: end,
      });
    }
  };

  const processedData = useMemo(() => {
    if (!data) return null;

    const { products, categories, summary, dailySales: dailySeries } = data;

    const attachRate =
      summary.ticketsWithComplements > 0
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
    console.log(crossSellGap);

    // 1. Filtramos los productos que SÍ son venta al público
    const ventasReales = products.filter(
      (p) => p.categoryName !== "Matados" && p.categoryName !== "Merma",
    );

    const onlyChicken = ventasReales.filter((p) => p.categoryName === "Pollo");
    const totalChickenKg = onlyChicken.reduce(
      (acc, p) => acc + p.quantitySold,
      0,
    );
    const complementTotalSale = ventasReales
      .filter((p) => p.categoryName !== "Pollo")
      .reduce((acc, p) => acc + p.totalSales, 0);

    const complementForKg =
      totalChickenKg > 0 ? complementTotalSale / totalChickenKg : 0;
    const rankingProductosComplemento = [...ventasReales]
      .filter((p) => p.categoryName !== "Pollo") // Quitamos el pollo
      .sort((a, b) => b.totalSales - a.totalSales) // Ordenamos por dinero
      .slice(0, 3);
    const totalVentaReal = ventasReales.reduce(
      (acc, p) => acc + p.totalSales,
      0,
    );
    const top5Products = [...ventasReales]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
      .map((p) => ({
        ...p,
        participation: (p.totalSales / totalVentaReal || 1) * 100,
      }));

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
      complementForKg,
      top5Products,
      rankingProductosComplemento,
      attachRate,
      topAffinity: topAffinityProduct?.productName || "No data",
      crossSellGap: crossSellGap > 0 ? crossSellGap : 0,
      weekdayRows,
      peak,
    };
  }, [data]);

  const summary = data?.summary;
  const products = data?.products || [];
  const categories = data?.categories || [];
  const dailySales = data?.dailySales || [];

  const dailySlaughteredAvg = useMemo(() => {
    const total = summary?.totalSlaughtered || 0;

    // Extraemos las fechas únicas del array de ventas que ya tienes en memoria
    // Suponiendo que 'data' son tus registros de ventas/beneficio
    const diasConVentas = data?.dailySales?.length || 0;

    return diasConVentas > 0 ? total / diasConVentas : 0;
  }, [summary, data]);
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      {/* Header & Filters */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Panel inteligente: Sucursales
          </h1>
          <p className="text-gray-400">
            Análisis de rendimiento, producción y control de mermas.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <BranchSelect value={selectedBranch} onChange={setSelectedBranch} />

          <DateRangePicker
            startDate={new Date(dates.start)}
            endDate={new Date(dates.end)}
            onChange={handleDateChange}
          />
        </div>
      </div>
      {!selectedBranch ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/30">
          <HiOutlineOfficeBuilding size={48} className="mb-4 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-400">
            Selecciona una sucursal
          </h2>
          <p className="text-gray-500">
            Elige una sucursal arriba para comenzar el análisis.
          </p>
        </div>
      ) : isLoading ? (
        <DashboardSkeleton />
      ) : isError || !processedData ? (
        <Alert color="failure">
          Ocurrió un error al cargar los datos estratégicos.
        </Alert>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* KPI: Pollo Beneficiado (Total) */}
            <KPICard
              title="Pollo Beneficiado"
              value={`${summary?.totalSlaughtered?.toLocaleString() || 0} pzas`}
              color="pink"
              icon={HiLightningBolt}
            />

            {/* KPI: Promedio Diario  */}
            <KPICard
              title="Promedio Beneficiado"
              value={`${dailySlaughteredAvg.toLocaleString(undefined, { maximumFractionDigits: 1 })} pzas/día`}
              color="orange"
              icon={HiChartBar}
            />

            <KPICard
              title="Venta Real"
              value={`$${processedData.totalVentaReal.toLocaleString()}`}
              color="blue"
              icon={HiCurrencyDollar}
            />

            <KPICard
              title="Ticket Promedio"
              value={`$${processedData.ticketPromedioReal.toFixed(2)}`}
              color="green"
              icon={HiTrendingUp}
            />

            <KPICard
              title="Pérdida Neta (Merma)"
              value={`${processedData.totalPerdidaNeta.toLocaleString()}`}
              color="red"
              icon={HiTrash}
            />
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Tendencia Diaria */}
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
                        fontSize={12}
                        tickFormatter={(str) => str.split("-")[2]}
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
                        // AQUÍ LA MAGIA:
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
              <TopProductsCard products={processedData.top5Products} />

              <Card className="border-none bg-gray-800 shadow-xl">
                <h3 className="text-md mb-2 font-semibold text-gray-200">
                  Ventas por categoría
                </h3>
                <div className="flex flex-col">
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      >
                        <Pie
                          data={processedData.categoriasComerciales as any[]}
                          dataKey="totalSales"
                          nameKey="categoryName"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          label={(props: any) => {
                            const {
                              cx,
                              cy,
                              midAngle,
                              innerRadius,
                              outerRadius,
                              percent,
                            } = props;

                            // 1. Bajamos el umbral: Si una categoría es > 1%, ya merece etiqueta
                            // if (percent < 0.01 || !cx || !cy) return null;

                            const RADIAN = Math.PI / 180;
                            const radius =
                              25 + innerRadius + (outerRadius - innerRadius);
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#9CA3AF"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                className="text-[10px] font-bold"
                              >
                                {/* Mostramos nombre corto + porcentaje para que la oficina sepa qué es qué */}
                                {`${(percent * 100).toFixed(1)}%`}
                              </text>
                            );
                          }}
                        >
                          {processedData.categoriasComerciales.map(
                            (_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "none",
                            borderRadius: "8px",
                          }}
                          itemStyle={{ color: "#fff" }}
                          // Formato con comas y signo de pesos
                          formatter={(value: number) => `${formatMXN(value)}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Leyenda Dinámica */}
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 px-2 pb-2">
                    {processedData.categoriasComerciales
                      .slice(0, 6)
                      .map((cat, i) => {
                        // Calculamos el porcentaje en tiempo real para la leyenda
                        const percentage = (
                          (cat.totalSales / processedData.totalVentaReal) *
                          100
                        ).toFixed(1);

                        return (
                          <div
                            key={cat.categoryId}
                            className="flex items-center justify-between gap-4 border-b border-gray-700/50 pb-1 text-xs"
                          >
                            <div className="flex items-start gap-2">
                              {" "}
                              {/* Cambiamos items-center por items-start para que el punto suba si hay mucho texto */}
                              <div
                                className="mt-1 h-3 w-3 flex-shrink-0 rounded-full" // <-- flex-shrink-0 es la clave
                                style={{
                                  backgroundColor: COLORS[i % COLORS.length],
                                }}
                              ></div>
                              <span className="leading-tight font-medium text-gray-300">
                                {cat.categoryName}
                              </span>
                            </div>

                            <div className="flex flex-col items-end">
                              <span className="font-bold text-white">
                                $
                                {cat.totalSales.toLocaleString("es-MX", {
                                  minimumFractionDigits: 0,
                                })}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </Card>
            </div>
            {/* Mix de Categorías LIMPIO (Solo comerciales) */}
          </div>

          {/* Tabla de Productos con todos los datos (La tabla interna manejará sus propios filtros) */}
          <div className="mt-8">
            <ProductSalesTable products={products} categories={categories} />
          </div>
        </>
      )}
    </div>
  );
};
