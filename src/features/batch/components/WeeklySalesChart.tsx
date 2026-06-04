import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Spinner } from "flowbite-react";
import { useQueries } from "@tanstack/react-query";
import type { BatchResponseDTO, BusinessUnitType } from "../types.batch";
import { batchKeys } from "../api/batch.keys";
import { getBatchFullDetail } from "../api/batch.api";
import { formatMXN } from "@/utils/moneyNumbers";
import { EggQuantityDisplay } from "./egg/EggQuantityDisplay";

interface WeeklySalesChartProps {
  batches: BatchResponseDTO[];
  unitType: BusinessUnitType;
}

interface TooltipPayloadItem {
  value: number;
  name: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  unitType: BusinessUnitType;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  unitType,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-600 bg-gray-900 p-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-gray-300">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          {item.name === "totalQuantity" ? (
            unitType === "EGG" ? (
              <EggQuantityDisplay totalPieces={item.value} className="text-xs" />
            ) : (
              <span className="font-medium text-white">
                {item.value.toLocaleString("es-MX")}{" "}
                {unitType === "LIVE_CHICKEN" ? "aves" : "unid."}
              </span>
            )
          ) : (
            <span className="font-medium text-green-400">
              {formatMXN(item.value)}
            </span>
          )}
          <span className="text-[10px] text-gray-500">
            {item.name === "totalQuantity" ? "Vendido" : "Ventas ($)"}
          </span>
        </div>
      ))}
    </div>
  );
};

interface WeeklyData {
  weekStart: string;
  label: string;
  totalQuantity: number;
  totalSales: number;
}

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatWeekLabel = (weekStart: Date): string => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const startDay = weekStart.getDate();
  const endDay = end.getDate();
  const month = new Intl.DateTimeFormat("es-MX", { month: "short" }).format(
    weekStart,
  );
  return `${startDay}-${endDay} ${month}`;
};

export const WeeklySalesChart: React.FC<WeeklySalesChartProps> = ({
  batches,
  unitType,
}) => {
  const batchIds = batches.map((b) => b.id);

  const detailQueries = useQueries({
    queries: batchIds.map((id) => ({
      queryKey: batchKeys.fullDetail(id),
      queryFn: () => getBatchFullDetail(id),
    })),
  });

  const isLoading = detailQueries.some((q) => q.isLoading);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const allMovements = detailQueries
    .filter((q) => q.data)
    .flatMap((q) => q.data?.movements || []);

  const salesMovements = allMovements.filter(
    (m: any) => m.type === "SALE" && m.date,
  );

  if (salesMovements.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <p className="text-center text-sm text-gray-400">
          No hay ventas registradas en este periodo.
        </p>
      </div>
    );
  }

  const weekMap = new Map<string, WeeklyData>();

  salesMovements.forEach((mov: any) => {
    const movDate = new Date(`${mov.date}T12:00:00`);
    const weekStart = getWeekStart(movDate);
    const key = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(key)) {
      weekMap.set(key, {
        weekStart: key,
        label: formatWeekLabel(weekStart),
        totalQuantity: 0,
        totalSales: 0,
      });
    }

    const week = weekMap.get(key)!;
    week.totalQuantity += Number(mov.quantity || 0);
    week.totalSales += Number(mov.saleTotal || 0);
  });

  const weeklyData = Array.from(weekMap.values()).sort(
    (a, b) => a.weekStart.localeCompare(b.weekStart),
  );

  const totalQuantity = weeklyData.reduce(
    (sum, w) => sum + w.totalQuantity,
    0,
  );
  const totalSales = weeklyData.reduce((sum, w) => sum + w.totalSales, 0);
  const weeklyAvg =
    weeklyData.length > 0 ? totalQuantity / weeklyData.length : 0;
  const bestWeek = weeklyData.reduce(
    (best, w) => (w.totalQuantity > best.totalQuantity ? w : best),
    weeklyData[0],
  );

  const unitLabel = unitType === "LIVE_CHICKEN" ? "aves" : "unidades";
  const isEgg = unitType === "EGG";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h3 className="mb-4 text-sm font-semibold text-white">
          Ventas por Semana
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={weeklyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#4B5563" }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip unitType={unitType} />}
            />
            <Bar
              dataKey="totalQuantity"
              name="totalQuantity"
              radius={[4, 4, 0, 0]}
            >
              {weeklyData.map((entry) => (
                <Cell
                  key={entry.weekStart}
                  fill={
                    entry.weekStart === bestWeek.weekStart
                      ? "#3B82F6"
                      : "#6366F1"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Total Vendido
          </p>
          <div className="mt-1 flex items-center justify-center">
            {isEgg ? (
              <EggQuantityDisplay totalPieces={totalQuantity} className="text-xs" />
            ) : (
              <span className="text-lg font-bold text-white">
                {totalQuantity}{" "}
                <span className="text-xs font-normal text-gray-400">
                  {unitLabel}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Total Ventas
          </p>
          <p className="mt-1 text-lg font-bold text-green-400">
            {formatMXN(totalSales)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Promedio / Semana
          </p>
          <div className="mt-1 flex items-center justify-center">
            {isEgg ? (
              <EggQuantityDisplay totalPieces={Math.round(weeklyAvg)} className="text-xs" />
            ) : (
              <span className="text-lg font-bold text-blue-400">
                {weeklyAvg.toFixed(0)}{" "}
                <span className="text-xs font-normal text-gray-400">
                  {unitLabel}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Mejor Semana
          </p>
          <div className="mt-1 flex items-center justify-center">
            {isEgg ? (
              <EggQuantityDisplay totalPieces={bestWeek.totalQuantity} className="text-xs" />
            ) : (
              <span className="text-lg font-bold text-purple-400">
                {bestWeek.totalQuantity}{" "}
                <span className="text-xs font-normal text-gray-400">
                  {unitLabel}
                </span>
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500">{bestWeek.label}</p>
        </div>
      </div>
    </div>
  );
};
