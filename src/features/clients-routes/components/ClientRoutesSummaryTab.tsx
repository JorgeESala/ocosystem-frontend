import React, { useState } from "react";
import { Alert, Button, Label, Select, Spinner } from "flowbite-react";
import { HiCheckCircle } from "react-icons/hi";
import {
  useRouteCalendar,
  useClientRoutesSummary,
} from "../api/summary.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate, toLocalDateString } from "@/utils/date.utils";
import { DateRangeFields } from "./DateRangeFields";
import { RouteWeekCalendar } from "./RouteWeekCalendar";
import {
  ClientTypesHelpContent,
  InfoTooltip,
  RouteProfitabilityHelpContent,
  SummaryAttentionHelpContent,
  SummaryKpiHelpContent,
} from "./ClientsRoutesHelpContent";
import { currentMonthRange } from "../config/unitConfig";

interface ClientRoutesSummaryTabProps {
  onShowClientsWithoutRoute: () => void;
  onShowDormantClients: (dormantDays: number) => void;
  onShowRoutesWithoutActivity: (period: { from: Date; to: Date }) => void;
  onShowRoutesWithoutLocalities: () => void;
}

const PERIOD_PRESETS = [
  { label: "Mes actual", days: null },
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
];

const DORMANT_OPTIONS = [15, 30, 60, 90];

const variationLabel = (pct: number | null): string => {
  if (pct == null) {
    return "—";
  }
  return `${pct >= 0 ? "↑" : "↓"} ${Math.abs(pct).toFixed(2)}%`;
};

const pointsLabel = (points: number | null): string => {
  if (points == null) {
    return "—";
  }
  return `${points > 0 ? "+" : ""}${points.toFixed(2)} pts`;
};

const KpiCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  hintColor?: string;
  tooltip?: React.ReactNode;
}> = ({ label, value, hint, hintColor = "text-emerald-400", tooltip }) => (
  <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
    <p className="flex items-center gap-1 text-xs text-gray-400">
      {label}
      {tooltip}
    </p>
    <p className="text-lg font-semibold text-white">{value}</p>
    {hint && <p className={`text-xs ${hintColor}`}>{hint}</p>}
  </div>
);

const AttentionCard: React.FC<{
  label: string;
  value: number;
  onClick: () => void;
  hint?: string;
}> = ({ label, value, onClick, hint }) => {
  const isEmpty = value === 0;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isEmpty}
      title={isEmpty ? "Sin pendientes" : undefined}
      className={`rounded-xl border p-3 text-left transition-colors ${
        isEmpty
          ? "cursor-not-allowed border-gray-700/60 bg-slate-900/40 opacity-60"
          : "border-amber-700/40 bg-amber-950/20 hover:border-amber-500/70 hover:bg-amber-950/40"
      }`}
    >
      <p
        className={`text-xs ${isEmpty ? "text-gray-500" : "text-amber-300/80"}`}
      >
        {label}
      </p>
      <p
        className={`text-xl font-semibold ${isEmpty ? "text-gray-500" : "text-amber-200"}`}
      >
        {value}
      </p>
      {hint && !isEmpty && (
        <p className="text-[11px] text-amber-400/70">{hint}</p>
      )}
    </button>
  );
};

const plural = (count: number, singular: string, pluralForm: string): string =>
  `${count} ${count === 1 ? singular : pluralForm}`;

const ClientTypeCard: React.FC<{
  label: string;
  active: number;
  inactive: number;
}> = ({ label, active, inactive }) => (
  <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-white">
      {plural(active, "activo", "activos")} ·{" "}
      {plural(inactive, "inactivo", "inactivos")}
    </p>
  </div>
);

export const ClientRoutesSummaryTab: React.FC<ClientRoutesSummaryTabProps> = ({
  onShowClientsWithoutRoute,
  onShowDormantClients,
  onShowRoutesWithoutActivity,
  onShowRoutesWithoutLocalities,
}) => {
  const [range, setRange] = useState<{ from: Date | null; to: Date | null }>(
    currentMonthRange,
  );
  const [dormantDays, setDormantDays] = useState(30);

  const from = range.from ? toLocalDateString(range.from) : null;
  const to = range.to ? toLocalDateString(range.to) : null;
  const { data, isLoading, isError, error } = useClientRoutesSummary(
    from,
    to,
    dormantDays,
  );
  const { data: calendar } = useRouteCalendar();

  const allAttentionClear = data
    ? [
        data.clients.withoutRoute,
        data.clients.withoutLocality,
        data.clients.dormant,
        data.clients.neverPurchased,
        data.routes.withoutActivity,
        data.routes.withoutLocalities,
      ].every((value) => value === 0)
    : false;

  const applyPreset = (days: number | null) => {
    if (days == null) {
      setRange(currentMonthRange());
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setRange({ from: start, to: end });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          {PERIOD_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              size="xs"
              color="light"
              onClick={() => applyPreset(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="min-w-[320px] flex-1">
          <DateRangeFields
            from={range.from}
            to={range.to}
            onChange={(newFrom, newTo) =>
              setRange({ from: newFrom, to: newTo })
            }
          />
        </div>
        <div>
          <Label htmlFor="dormant-days">Clientes dormidos</Label>
          <Select
            id="dormant-days"
            value={String(dormantDays)}
            onChange={(e) => setDormantDays(Number(e.target.value))}
          >
            {DORMANT_OPTIONS.map((days) => (
              <option key={days} value={days}>
                +{days} días sin compra
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : isError || !data ? (
        <Alert color="failure">
          Error al cargar el resumen:{" "}
          {error instanceof Error ? error.message : "desconocido"}
        </Alert>
      ) : (
        <>
          <p className="text-xs text-gray-500" data-testid="summary-period">
            {formatHumanDate(data.period.from, "short")} –{" "}
            {formatHumanDate(data.period.to, "short")} · vs{" "}
            {formatHumanDate(data.period.previousFrom, "short")} –{" "}
            {formatHumanDate(data.period.previousTo, "short")}
          </p>

          <div
            className="grid grid-cols-2 gap-3 lg:grid-cols-6"
            data-testid="summary-kpis"
          >
            <KpiCard
              label="Ventas"
              value={formatMXN(data.sales.totalSales)}
              hint={variationLabel(data.sales.variation.salesPct)}
              hintColor={
                (data.sales.variation.salesPct ?? 0) >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }
              tooltip={
                <InfoTooltip
                  label="¿Qué significan estos números?"
                  content={<SummaryKpiHelpContent />}
                />
              }
            />
            <KpiCard
              label="Utilidad"
              value={formatMXN(data.sales.profit)}
              hint={variationLabel(data.sales.variation.profitPct)}
              hintColor={
                (data.sales.variation.profitPct ?? 0) >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }
              tooltip={
                <InfoTooltip
                  label="¿Cómo se calcula la utilidad?"
                  content={<RouteProfitabilityHelpContent />}
                />
              }
            />
            <KpiCard
              label="Margen"
              value={
                data.sales.marginPct != null
                  ? `${data.sales.marginPct.toFixed(2)}%`
                  : "—"
              }
              hint={pointsLabel(data.sales.variation.marginPoints)}
              hintColor={
                (data.sales.variation.marginPoints ?? 0) >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            />
            <KpiCard
              label="Ticket promedio"
              value={
                data.sales.averageTicket != null
                  ? formatMXN(data.sales.averageTicket)
                  : "—"
              }
            />
            <KpiCard
              label="Clientes activos"
              value={String(data.clients.active)}
              hint={`${data.clients.dormant} dormidos`}
              hintColor="text-amber-400"
            />
            <KpiCard
              label="Top 10 clientes"
              value={
                data.sales.top10SharePct != null
                  ? `${data.sales.top10SharePct.toFixed(2)}%`
                  : "—"
              }
              hint="de las ventas"
              hintColor="text-gray-400"
            />
          </div>

          <section className="space-y-2">
            <h3 className="flex items-center gap-1 text-sm font-semibold text-white">
              Necesitan atención
              <InfoTooltip
                label="¿Qué significan las alertas?"
                content={<SummaryAttentionHelpContent />}
              />
            </h3>
            {allAttentionClear ? (
              <div
                className="flex items-center gap-2 rounded-xl border border-emerald-700/50 bg-emerald-950/30 p-4 text-sm text-emerald-200"
                data-testid="attention-all-clear"
              >
                <HiCheckCircle className="h-5 w-5" />
                <span>
                  Todo al día · sin clientes ni rutas pendientes por atender
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <AttentionCard
                  label="Clientes sin ruta"
                  value={data.clients.withoutRoute}
                  onClick={onShowClientsWithoutRoute}
                />
                <AttentionCard
                  label="Clientes sin localidad"
                  value={data.clients.withoutLocality}
                  onClick={onShowClientsWithoutRoute}
                />
                <AttentionCard
                  label="Clientes dormidos"
                  value={data.clients.dormant}
                  hint={`+${dormantDays} días sin compra`}
                  onClick={() => onShowDormantClients(dormantDays)}
                />
                <AttentionCard
                  label="Nunca han comprado"
                  value={data.clients.neverPurchased}
                  onClick={onShowClientsWithoutRoute}
                />
                <AttentionCard
                  label="Rutas sin actividad"
                  value={data.routes.withoutActivity}
                  onClick={() => {
                    if (range.from && range.to) {
                      onShowRoutesWithoutActivity({
                        from: range.from,
                        to: range.to,
                      });
                    }
                  }}
                />
                <AttentionCard
                  label="Rutas sin localidades"
                  value={data.routes.withoutLocalities}
                  onClick={onShowRoutesWithoutLocalities}
                />
              </div>
            )}
          </section>

          <section
            className="rounded-2xl border border-gray-700 p-3"
            data-testid="client-types"
          >
            <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-white">
              Clientes por tipo
              <InfoTooltip
                label="¿Qué tipos de cliente hay?"
                content={<ClientTypesHelpContent />}
              />
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ClientTypeCard
                label="Sucursales"
                active={data.clients.byType.branchesActive}
                inactive={data.clients.byType.branchesInactive}
              />
              <ClientTypeCard
                label="Internos"
                active={data.clients.byType.internalActive}
                inactive={data.clients.byType.internalInactive}
              />
              <ClientTypeCard
                label="Externos"
                active={data.clients.byType.externalActive}
                inactive={data.clients.byType.externalInactive}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section
              className="rounded-2xl border border-gray-700 p-3"
              data-testid="top-clients"
            >
              <h3 className="mb-2 text-sm font-semibold text-white">
                Top 10 clientes
              </h3>
              {data.topClients.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  Sin ventas con cliente en el periodo.
                </p>
              ) : (
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs tracking-[0.18em] text-gray-400 uppercase">
                    <tr>
                      <th className="py-2">Cliente</th>
                      <th className="py-2 text-right">Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topClients.map((client) => (
                      <tr
                        key={client.clientId}
                        className="border-t border-gray-800"
                      >
                        <td className="py-2">
                          {client.businessName ? (
                            <span className="flex flex-col">
                              <span>{client.businessName}</span>
                              <span className="text-xs text-gray-500">
                                {client.name}
                              </span>
                            </span>
                          ) : (
                            client.name
                          )}
                        </td>
                        <td className="py-2 text-right text-blue-400">
                          {formatMXN(client.totalSales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section
              className="rounded-2xl border border-gray-700 p-3"
              data-testid="top-routes"
            >
              <h3 className="mb-2 text-sm font-semibold text-white">
                Top 10 rutas
              </h3>
              {data.topRoutes.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  Sin ventas por ruta en el periodo.
                </p>
              ) : (
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs tracking-[0.18em] text-gray-400 uppercase">
                    <tr>
                      <th className="py-2">Ruta</th>
                      <th className="py-2 text-right">Ventas</th>
                      <th className="py-2 text-right">Utilidad</th>
                      <th className="py-2 text-right">Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topRoutes.map((route) => (
                      <tr
                        key={route.routeId}
                        className="border-t border-gray-800"
                      >
                        <td className="py-2">{route.routeName}</td>
                        <td className="py-2 text-right text-blue-400">
                          {formatMXN(route.totalSales)}
                        </td>
                        <td
                          className={`py-2 text-right font-medium ${
                            route.profit < 0
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {formatMXN(route.profit)}
                        </td>
                        <td className="py-2 text-right">
                          {route.marginPct != null
                            ? `${Number(route.marginPct).toFixed(2)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white">
              Calendario semanal de rutas
            </h3>
            <RouteWeekCalendar entries={calendar ?? []} />
          </section>
        </>
      )}
    </div>
  );
};
