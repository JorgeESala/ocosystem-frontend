import React, { useMemo } from "react";
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
import type { BusinessUnitType } from "../types.batch";
import { useWeeklySalesReport } from "../api/batch.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { EggQuantityDisplay } from "./egg/EggQuantityDisplay";
import type { SupplierBreakdownItem } from "../types.batch";

interface WeeklySalesChartProps {
  unitType: BusinessUnitType;
  startDate: Date | null;
  endDate: Date | null;
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
              <EggQuantityDisplay
                totalPieces={item.value}
                className="text-xs"
              />
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

const formatWeekLabel = (
  weekStart: string,
  filterStart: Date | null,
  filterEnd: Date | null,
): string => {
  const weekStartDate = new Date(`${weekStart}T00:00:00`);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const clippedStart =
    filterStart && weekStartDate < filterStart
      ? new Date(filterStart)
      : weekStartDate;
  const clippedEnd =
    filterEnd && weekEndDate > filterEnd ? new Date(filterEnd) : weekEndDate;

  const startDay = clippedStart.getDate();
  const endDay = clippedEnd.getDate();
  const month = new Intl.DateTimeFormat("es-MX", { month: "short" }).format(
    clippedStart,
  );
  return `${startDay}-${endDay} ${month}`;
};

export const WeeklySalesChart: React.FC<WeeklySalesChartProps> = ({
  unitType,
  startDate,
  endDate,
}) => {
  const startDateStr = startDate ? startDate.toISOString().split("T")[0] : null;
  const endDateStr = endDate ? endDate.toISOString().split("T")[0] : null;

  const { data: rawData = [], isLoading } = useWeeklySalesReport(
    startDateStr,
    endDateStr,
  );

  const weeklyData = rawData.map((w) => ({
    ...w,
    label: formatWeekLabel(w.weekStart, startDate, endDate),
  }));

  const supplierTotals = useMemo<SupplierBreakdownItem[]>(() => {
    const map = new Map<number, SupplierBreakdownItem>();
    for (const week of rawData) {
      for (const item of week.supplierBreakdown ?? []) {
        const existing = map.get(item.supplierId);
        if (existing) {
          existing.totalQuantity += item.totalQuantity;
          existing.totalSales += item.totalSales;
        } else {
          map.set(item.supplierId, { ...item });
        }
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.totalQuantity - a.totalQuantity,
    );
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (weeklyData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <p className="text-center text-sm text-gray-400">
          No hay ventas registradas en este periodo.
        </p>
      </div>
    );
  }

  const totalQuantity = weeklyData.reduce((sum, w) => sum + w.totalQuantity, 0);
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
            <Tooltip content={<CustomTooltip unitType={unitType} />} />
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
          <p className="text-[10px] tracking-wider text-gray-500 uppercase">
            Total Vendido
          </p>
          <div className="mt-1 flex items-center justify-center">
            {isEgg ? (
              <EggQuantityDisplay
                totalPieces={totalQuantity}
                className="text-xs"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {totalQuantity}{" "}
                <span className="text-xs font-normal text-gray-400">
                  {unitLabel}
                </span>
              </span>
            )}
          </div>
          {supplierTotals.length > 0 && (
            <div className="mt-3 border-t border-gray-700 pt-2 text-left">
              <p className="mb-1 text-[10px] tracking-wider text-gray-500 uppercase">
                Por proveedor
              </p>
              <ul className="space-y-1">
                {supplierTotals.map((s) => (
                  <li
                    key={s.supplierId}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate text-gray-300">
                      {s.supplierName}
                    </span>
                    {isEgg ? (
                      <EggQuantityDisplay
                        totalPieces={s.totalQuantity}
                        className="text-[10px]"
                      />
                    ) : (
                      <span className="text-gray-300">
                        {s.totalQuantity.toLocaleString("es-MX")}{" "}
                        <span className="text-[10px] text-gray-500">
                          {unitLabel}
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center">
          <p className="text-[10px] tracking-wider text-gray-500 uppercase">
            Total Ventas
          </p>
          <p className="mt-1 text-lg font-bold text-green-400">
            {formatMXN(totalSales)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center">
          <p className="text-[10px] tracking-wider text-gray-500 uppercase">
            Promedio / Semana
          </p>
          <div className="mt-1 flex items-center justify-center">
            {isEgg ? (
              <EggQuantityDisplay
                totalPieces={Math.round(weeklyAvg)}
                className="text-xs"
              />
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
          <p className="text-[10px] tracking-wider text-gray-500 uppercase">
            Mejor Semana
          </p>
          <div className="mt-1 flex items-center justify-center">
            {isEgg ? (
              <EggQuantityDisplay
                totalPieces={bestWeek.totalQuantity}
                className="text-xs"
              />
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
