import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRoutePerformance } from "@/core/api/route/routes.queries";
import type { RoutePerformance } from "@/core/api/route/route.api";
import type { ComparisonMode, Route } from "@/core/api/types";
import { EggQuantityDisplay } from "@/features/batch/components/egg/EggQuantityDisplay";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate, toLocalDateString } from "@/utils/date.utils";
import { DateRangeFields } from "./DateRangeFields";
import {
  ComparisonHelpContent,
  InfoTooltip,
  RouteProfitabilityHelpContent,
} from "./ClientsRoutesHelpContent";
import {
  monthToDateRange,
  type ClientsRoutesUnitType,
} from "../config/unitConfig";
import { previousRangeFor } from "../utils/comparison";

interface RoutePerformanceModalProps {
  show: boolean;
  onClose: () => void;
  unitType: ClientsRoutesUnitType;
  routes: Route[];
  initialRange?: { from: Date; to: Date } | null;
}

const EMPTY_ROW = (route: Route): RoutePerformance => ({
  routeId: route.id,
  routeName: route.name,
  totalQuantity: 0,
  totalSales: 0,
  cogs: 0,
  fuelExpense: 0,
  profit: 0,
  marginPct: null,
  previousTotalSales: 0,
  previousProfit: 0,
  salesPct: null,
  profitPct: null,
  saleCount: 0,
});

const sum = (rows: RoutePerformance[], key: keyof RoutePerformance): number =>
  rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);

export const RoutePerformanceModal: React.FC<RoutePerformanceModalProps> = ({
  show,
  onClose,
  unitType,
  routes,
  initialRange,
}) => {
  const [range, setRange] = useState<{ from: Date | null; to: Date | null }>(
    () => initialRange ?? monthToDateRange(),
  );
  const [comparison, setComparison] =
    useState<ComparisonMode>("PREVIOUS_MONTH");

  useEffect(() => {
    if (initialRange) {
      setRange(initialRange);
    }
  }, [initialRange]);

  const from = range.from ? toLocalDateString(range.from) : null;
  const to = range.to ? toLocalDateString(range.to) : null;
  const { data, isLoading, isError, error } = useRoutePerformance(
    from,
    to,
    comparison,
  );
  const comparedRange =
    from && to ? previousRangeFor(from, to, comparison) : null;

  const rows = useMemo(() => {
    const byRoute = new Map<number | null, RoutePerformance>();
    (data ?? []).forEach((row) => byRoute.set(row.routeId ?? null, row));

    const merged: RoutePerformance[] = routes.map(
      (route) => byRoute.get(route.id) ?? EMPTY_ROW(route),
    );
    const knownIds = new Set(routes.map((route) => route.id));
    (data ?? []).forEach((row) => {
      if (
        row.routeId === null ||
        row.routeId === undefined ||
        !knownIds.has(row.routeId)
      ) {
        merged.push(row);
      }
    });
    return merged;
  }, [data, routes]);

  const chartData = rows.map((row) => ({
    name: row.routeName ?? "Ventas sin ruta",
    ventas: Number(row.totalSales),
    costo: Number(row.cogs),
    combustible: Number(row.fuelExpense),
  }));

  const totals = useMemo(
    () => ({
      totalSales: sum(rows, "totalSales"),
      cogs: sum(rows, "cogs"),
      fuelExpense: sum(rows, "fuelExpense"),
      profit: sum(rows, "profit"),
    }),
    [rows],
  );
  const totalMarginPct =
    totals.totalSales > 0
      ? ((totals.profit / totals.totalSales) * 100).toFixed(2)
      : null;

  const quantityLabel = (quantity: number) =>
    unitType === "EGG" ? (
      <EggQuantityDisplay totalPieces={quantity} className="text-xs" />
    ) : (
      <span>{quantity.toLocaleString("es-MX")} aves</span>
    );

  const profitColor = (profit: number) =>
    profit < 0 ? "text-red-400" : "text-emerald-400";

  const summaryCards = [
    {
      label: "Ventas totales",
      value: formatMXN(totals.totalSales),
      color: "text-blue-400",
    },
    {
      label: "Costo remesa",
      value: formatMXN(totals.cogs),
      color: "text-gray-300",
    },
    {
      label: "Combustible",
      value: formatMXN(totals.fuelExpense),
      color: "text-amber-400",
    },
    {
      label: "Utilidad total",
      value: formatMXN(totals.profit),
      color: profitColor(totals.profit),
    },
    {
      label: "Margen",
      value: totalMarginPct !== null ? `${totalMarginPct}%` : "—",
      color: profitColor(totals.profit),
    },
  ];

  return (
    <Modal show={show} size="6xl" popup onClose={onClose}>
      <ModalHeader>Rendimiento y rentabilidad por ruta</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <DateRangeFields
            from={range.from}
            to={range.to}
            onChange={(newFrom, newTo) => {
              setRange({ from: newFrom, to: newTo });
              setComparison("WINDOW");
            }}
          />

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : isError ? (
            <Alert color="failure">
              Error al cargar el rendimiento:{" "}
              {error instanceof Error ? error.message : "desconocido"}
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {summaryCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-gray-700 bg-slate-900/60 p-3"
                  >
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      {card.label}
                      {card.label === "Utilidad total" && (
                        <InfoTooltip
                          label="¿Cómo se calcula la utilidad?"
                          content={<RouteProfitabilityHelpContent />}
                        />
                      )}
                    </p>
                    <p className={`text-lg font-semibold ${card.color}`}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="h-64 w-full"
                data-testid="route-performance-chart"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                      }}
                    />
                    <Bar dataKey="ventas" name="Ventas" fill="#3b82f6" />
                    <Bar dataKey="costo" name="Costo" fill="#64748b" />
                    <Bar
                      dataKey="combustible"
                      name="Combustible"
                      fill="#f59e0b"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-700">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-gray-400 uppercase">
                    <tr>
                      <th className="px-4 py-3">Ruta</th>
                      <th className="px-4 py-3">Cantidad</th>
                      <th className="px-4 py-3 text-right">Ventas</th>
                      <th className="px-4 py-3 text-right">Costo</th>
                      <th className="px-4 py-3 text-right">Combustible</th>
                      <th className="px-4 py-3 text-right">Utilidad</th>
                      <th className="px-4 py-3 text-right">Margen</th>
                      <th className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1">
                          Var. ventas
                          <InfoTooltip
                            label="¿Contra qué periodo compara?"
                            content={
                              <ComparisonHelpContent
                                previousFromLabel={
                                  comparedRange
                                    ? formatHumanDate(
                                        comparedRange.from,
                                        "short",
                                      )
                                    : "—"
                                }
                                previousToLabel={
                                  comparedRange
                                    ? formatHumanDate(comparedRange.to, "short")
                                    : "—"
                                }
                              />
                            }
                          />
                        </span>
                      </th>
                      <th className="px-4 py-3 text-right">Ventas #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.routeId ?? "none"}
                        className="border-t border-gray-800"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {row.routeName ?? "Ventas sin ruta"}
                        </td>
                        <td className="px-4 py-3">
                          {quantityLabel(Number(row.totalQuantity))}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-400">
                          {formatMXN(Number(row.totalSales))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatMXN(Number(row.cogs))}
                        </td>
                        <td className="px-4 py-3 text-right text-amber-400">
                          {formatMXN(Number(row.fuelExpense))}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium ${profitColor(Number(row.profit))}`}
                        >
                          {formatMXN(Number(row.profit))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.marginPct != null
                            ? `${Number(row.marginPct).toFixed(2)}%`
                            : "—"}
                        </td>
                        <td
                          className={`px-4 py-3 text-right ${
                            (row.salesPct ?? 0) >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {row.salesPct != null
                            ? `${row.salesPct >= 0 ? "↑" : "↓"} ${Math.abs(Number(row.salesPct)).toFixed(2)}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.saleCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};
