import React, { useState, useMemo } from "react";
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
import { useSalesByClient } from "../api/batch.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { EggQuantityDisplay } from "./egg/EggQuantityDisplay";

interface SalesByClientChartProps {
  unitType: BusinessUnitType;
  startDate: Date | null;
  endDate: Date | null;
}

interface TooltipPayloadItem {
  value: number;
  name: string;
  dataKey: string;
  payload: {
    clientName: string;
    isInternalBranch: boolean;
    totalSales: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  unitType: BusinessUnitType;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  unitType,
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const isEgg = unitType === "EGG";

  return (
    <div className="rounded-lg border border-gray-600 bg-gray-900 p-3 shadow-xl">
      <div className="mb-2 flex items-center gap-2">
        {data.isInternalBranch && (
          <span className="rounded bg-blue-800 px-1.5 py-0.5 text-[10px] font-semibold text-blue-200">
            Sucursal
          </span>
        )}
        <p className="text-xs font-semibold text-white">{data.clientName}</p>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          {isEgg ? (
            <EggQuantityDisplay
              totalPieces={payload[0].value}
              className="text-xs"
            />
          ) : (
            <span className="font-medium text-white">
              {payload[0].value.toLocaleString("es-MX")}{" "}
              {unitType === "LIVE_CHICKEN" ? "aves" : "unid."}
            </span>
          )}
          <span className="text-[10px] text-gray-500">Vendido</span>
        </div>
        <p className="font-medium text-green-400">
          {formatMXN(data.totalSales)}
        </p>
      </div>
    </div>
  );
};

const BRANCH_COLOR = "#3B82F6";
const REGULAR_COLOR = "#6366F1";

export const SalesByClientChart: React.FC<SalesByClientChartProps> = ({
  unitType,
  startDate,
  endDate,
}) => {
  const [showBranches, setShowBranches] = useState(true);
  const [showRegular, setShowRegular] = useState(true);

  const startDateStr = startDate ? startDate.toISOString().split("T")[0] : null;
  const endDateStr = endDate ? endDate.toISOString().split("T")[0] : null;

  const { data: rawData = [], isLoading } = useSalesByClient(
    startDateStr,
    endDateStr,
  );

  const branchClients = useMemo(
    () =>
      rawData
        .filter((c) => c.isInternalBranch)
        .sort((a, b) => b.totalQuantity - a.totalQuantity),
    [rawData],
  );

  const regularClients = useMemo(
    () =>
      rawData
        .filter((c) => !c.isInternalBranch)
        .sort((a, b) => b.totalQuantity - a.totalQuantity),
    [rawData],
  );

  const sortedData = useMemo(
    () => [...branchClients, ...regularClients],
    [branchClients, regularClients],
  );

  const visibleData = useMemo(
    () =>
      sortedData.filter(
        (c) =>
          (c.isInternalBranch && showBranches) ||
          (!c.isInternalBranch && showRegular),
      ),
    [sortedData, showBranches, showRegular],
  );

  const branchQuantity = branchClients.reduce(
    (sum, c) => sum + c.totalQuantity,
    0,
  );
  const branchSales = branchClients.reduce((sum, c) => sum + c.totalSales, 0);
  const regularQuantity = regularClients.reduce(
    (sum, c) => sum + c.totalQuantity,
    0,
  );
  const regularSales = regularClients.reduce((sum, c) => sum + c.totalSales, 0);

  const isEgg = unitType === "EGG";
  const unitLabel = unitType === "LIVE_CHICKEN" ? "aves" : "unidades";

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (rawData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <p className="text-center text-sm text-gray-400">
          No hay ventas registradas en este periodo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-blue-800 bg-blue-900/50 p-3 text-center">
          <p className="text-[10px] tracking-wider text-blue-400 uppercase">
            Unidades a Clientes internos
          </p>
          <div className="mt-1 flex items-center justify-center">
            {isEgg ? (
              <EggQuantityDisplay
                totalPieces={branchQuantity}
                className="text-xs"
              />
            ) : (
              <span className="text-lg font-bold text-blue-300">
                {branchQuantity.toLocaleString("es-MX")}{" "}
                <span className="text-xs font-normal text-blue-400">
                  {unitLabel}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-blue-800 bg-blue-900/50 p-3 text-center">
          <p className="text-[10px] tracking-wider text-blue-400 uppercase">
            Ventas a Clientes internos
          </p>
          <p className="mt-1 text-lg font-bold text-blue-300">
            {formatMXN(branchSales)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center">
          <p className="text-[10px] tracking-wider text-gray-500 uppercase">
            Unidades a Clientes
          </p>
          <div className="mt-1 flex items-center justify-center">
            {isEgg ? (
              <EggQuantityDisplay
                totalPieces={regularQuantity}
                className="text-xs"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {regularQuantity.toLocaleString("es-MX")}{" "}
                <span className="text-xs font-normal text-gray-400">
                  {unitLabel}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center">
          <p className="text-[10px] tracking-wider text-gray-500 uppercase">
            Ventas a Clientes
          </p>
          <p className="mt-1 text-lg font-bold text-green-400">
            {formatMXN(regularSales)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Ventas por Cliente
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBranches((v) => !v)}
              className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 ${
                showBranches ? "opacity-100" : "opacity-40"
              }`}
            >
              {showBranches ? (
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: BRANCH_COLOR }}
                />
              ) : (
                <div
                  className="h-2.5 w-2.5 rounded-full border-[1.5px]"
                  style={{ borderColor: BRANCH_COLOR }}
                />
              )}
              <span className="text-[10px] text-gray-400">
                Clientes internos
              </span>
            </button>
            <button
              onClick={() => setShowRegular((v) => !v)}
              className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 ${
                showRegular ? "opacity-100" : "opacity-40"
              }`}
            >
              {showRegular ? (
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: REGULAR_COLOR }}
                />
              ) : (
                <div
                  className="h-2.5 w-2.5 rounded-full border-[1.5px]"
                  style={{ borderColor: REGULAR_COLOR }}
                />
              )}
              <span className="text-[10px] text-gray-400">
                Clientes Externos
              </span>
            </button>
          </div>
        </div>

        {visibleData.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No hay ventas para mostrar con los filtros activos.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={Math.max(250, visibleData.length * 32)}
          >
            <BarChart
              data={visibleData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#4B5563" }}
              />
              <YAxis
                type="category"
                dataKey="clientName"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                content={<CustomTooltip unitType={unitType} />}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar
                dataKey="totalQuantity"
                name="totalQuantity"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {visibleData.map((entry) => (
                  <Cell
                    key={entry.clientId}
                    fill={entry.isInternalBranch ? BRANCH_COLOR : REGULAR_COLOR}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
