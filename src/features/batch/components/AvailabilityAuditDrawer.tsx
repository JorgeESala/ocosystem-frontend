import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Select,
  Spinner,
} from "flowbite-react";
import { HiDownload, HiX } from "react-icons/hi";
import { EggQuantityDisplay } from "./egg/EggQuantityDisplay";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { usePendingOrderBreakdown } from "@/features/route-orders/api/routeOrders.queries";
import type {
  PendingOrderDayDTO,
  PendingOrderRouteDTO,
} from "@/features/route-orders/types/routeOrder.types";
import type { BatchResponseDTO } from "../types.batch";

type UnitType = "EGG" | "LIVE_CHICKEN";
type TabKey = "day" | "batches";

interface Props {
  open: boolean;
  onClose: () => void;
  unitType: UnitType;
  startDate: string | null;
  endDate: string | null;
  includedBatches: BatchResponseDTO[];
  allBatches: BatchResponseDTO[];
  totalRemainingUnits: number;
}

interface BatchRow {
  batch: BatchResponseDTO;
  included: boolean;
  reason: string;
}

const numberFormat = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 3,
});

const formatNumber = (value: number) => numberFormat.format(value);

const formatUnits = (value: number, unitType: UnitType) =>
  unitType === "EGG"
    ? `${formatNumber(value)} casilleros`
    : `${formatNumber(value)} aves`;

const csvCell = (value: string | number | null | undefined) => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
  const content = `\uFEFF${rows
    .map((row) => row.map(csvCell).join(","))
    .join("\n")}`;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const entryDateKey = (batch: BatchResponseDTO) =>
  String(batch.entryDate).slice(0, 10);

const batchQuantity = (batch: BatchResponseDTO, unitType: UnitType) =>
  unitType === "EGG"
    ? (batch.remainingBoxes || 0) * 360 +
      (batch.remainingCartons || 0) * 30 +
      (batch.remainingPieces || 0)
    : Number(batch.remainingQuantity);

export const AvailabilityAuditDrawer: React.FC<Props> = ({
  open,
  onClose,
  unitType,
  startDate,
  endDate,
  includedBatches,
  allBatches,
  totalRemainingUnits,
}) => {
  const [tab, setTab] = useState<TabKey>("day");
  const [routeFilter, setRouteFilter] = useState("");

  const { data, isLoading, isError, error } = usePendingOrderBreakdown(
    startDate,
    endDate,
    open,
  );

  useEffect(() => {
    if (open) {
      setTab("day");
      setRouteFilter("");
    }
  }, [open]);

  const includedIds = useMemo(
    () => new Set(includedBatches.map((batch) => batch.id)),
    [includedBatches],
  );

  const batchRows = useMemo<BatchRow[]>(() => {
    const rows = new Map<number, BatchRow>();
    for (const batch of allBatches) {
      if (includedIds.has(batch.id)) {
        rows.set(batch.id, { batch, included: true, reason: "Incluida" });
        continue;
      }
      const remaining = batchQuantity(batch, unitType);
      let reason = "No incluida";
      if (remaining <= 0) {
        reason = "Sin existencia";
      } else if (
        startDate &&
        endDate &&
        (entryDateKey(batch) < startDate || entryDateKey(batch) > endDate)
      ) {
        reason = "Fuera del rango de fechas";
      }
      rows.set(batch.id, { batch, included: false, reason });
    }
    for (const batch of includedBatches) {
      if (!rows.has(batch.id)) {
        rows.set(batch.id, { batch, included: true, reason: "Incluida" });
      }
    }
    return Array.from(rows.values()).sort((left, right) =>
      entryDateKey(right.batch).localeCompare(entryDateKey(left.batch)),
    );
  }, [allBatches, includedBatches, includedIds, startDate, endDate, unitType]);

  const includedRows = batchRows.filter((row) => row.included);
  const excludedRows = batchRows.filter((row) => !row.included);

  const routeOptions = useMemo(() => {
    const routes = new Map<number, string>();
    for (const day of data?.days ?? []) {
      for (const route of day.routes) {
        routes.set(route.routeId, route.routeName);
      }
    }
    return Array.from(routes.entries()).sort((left, right) =>
      left[1].localeCompare(right[1], "es"),
    );
  }, [data]);

  const filteredDays = useMemo<PendingOrderDayDTO[]>(() => {
    if (!data) return [];
    if (!routeFilter) return data.days;
    const routeId = Number(routeFilter);
    return data.days
      .map((day) => ({
        ...day,
        routes: day.routes.filter((route) => route.routeId === routeId),
      }))
      .filter((day) => day.routes.length > 0);
  }, [data, routeFilter]);

  const visiblePendingQuantity = routeFilter
    ? filteredDays.reduce((sum, day) => sum + day.quantity, 0)
    : (data?.totalQuantity ?? 0);

  const visiblePendingLines = routeFilter
    ? filteredDays.reduce((sum, day) => sum + day.lineCount, 0)
    : (data?.lineCount ?? 0);

  const pendingWithoutTrip = useMemo(
    () =>
      (data?.days ?? []).reduce(
        (sum, day) =>
          sum +
          day.routes.reduce(
            (routeSum, route) =>
              routeSum +
              route.orders.filter((order) => order.tripId == null).length,
            0,
          ),
        0,
      ),
    [data],
  );

  const availableAfterOrders = totalRemainingUnits - visiblePendingQuantity;

  const exportPending = () => {
    const rows: Array<Array<string | number>> = [
      [
        "Fecha",
        "Ruta",
        "Pedido",
        "Viaje",
        "Chofer",
        "Cliente",
        "Negocio",
        "Localidad",
        "Cantidad",
        "Unidad",
      ],
    ];
    for (const day of data?.days ?? []) {
      for (const route of day.routes) {
        for (const order of route.orders) {
          for (const line of order.lines) {
            rows.push([
              day.date,
              route.routeName,
              order.orderId,
              order.tripId ?? "Sin viaje",
              order.driverName ?? "",
              line.clientName,
              line.businessName ?? "",
              line.localityName ?? "",
              line.quantity,
              unitType === "EGG" ? "casilleros" : "aves",
            ]);
          }
        }
      }
    }
    downloadCsv(`pedidos-pendientes-${startDate}-${endDate}.csv`, rows);
  };

  const exportBatches = () => {
    const rows: Array<Array<string | number>> = [
      [
        "Remesa",
        "Fecha entrada",
        "Incluida",
        "Motivo",
        "Inicial",
        "Vendido",
        "Ajustes",
        "Restante",
        "Valor disponible",
      ],
    ];
    for (const row of batchRows) {
      rows.push([
        row.batch.id,
        entryDateKey(row.batch),
        row.included ? "Sí" : "No",
        row.reason,
        Number(row.batch.initialQuantity ?? 0),
        Number(row.batch.soldQuantity ?? 0),
        Number(row.batch.adjustedQuantity ?? 0),
        batchQuantity(row.batch, unitType),
        row.batch.availableCost ?? "",
      ]);
    }
    downloadCsv(`remesas-disponibilidad-${startDate}-${endDate}.csv`, rows);
  };

  const renderQuantity = (value: number) =>
    unitType === "EGG" ? (
      <span className="flex items-center gap-2">
        <EggQuantityDisplay totalPieces={Math.max(0, value * 30)} />
        <span className="text-[11px] text-gray-400">
          {formatNumber(value)} casilleros
        </span>
      </span>
    ) : (
      <span>{formatUnits(value, unitType)}</span>
    );

  const renderDay = (day: PendingOrderDayDTO) => {
    const routes = routeFilter
      ? day.routes.filter((route) => String(route.routeId) === routeFilter)
      : day.routes;
    const quantity = routes.reduce((sum, route) => sum + route.quantity, 0);
    const lineCount = routes.reduce((sum, route) => sum + route.lineCount, 0);

    return (
      <details
        key={day.date}
        className="rounded-lg border border-gray-700 bg-slate-950/60"
      >
        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm">
          <span className="font-semibold text-white">
            {formatHumanDate(day.date)}
          </span>
          <span className="flex items-center gap-3 text-xs text-gray-300">
            <span>{renderQuantity(quantity)}</span>
            <span>
              {lineCount} línea{lineCount === 1 ? "" : "s"}
            </span>
          </span>
        </summary>
        <div className="space-y-2 border-t border-gray-800 p-3">
          {routes.map((route) => renderRoute(day.date, route))}
        </div>
      </details>
    );
  };

  const renderRoute = (date: string, route: PendingOrderRouteDTO) => (
    <details
      key={`${date}-${route.routeId}`}
      className="rounded-md border border-gray-800 bg-gray-900/40"
    >
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-3 py-2 text-xs">
        <span className="font-semibold text-blue-200">{route.routeName}</span>
        <span className="flex items-center gap-3 text-gray-300">
          <span>{renderQuantity(route.quantity)}</span>
          <span>{route.orders.length} pedido(s)</span>
        </span>
      </summary>
      <div className="space-y-2 border-t border-gray-800 p-2">
        {route.orders.map((order) => (
          <details
            key={order.orderId}
            className="rounded border border-gray-800 bg-slate-950/60"
          >
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-2 py-1.5 text-xs">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-white">
                  Pedido #{order.orderId}
                </span>
                <span
                  className={
                    order.tripId == null
                      ? "rounded bg-amber-900/40 px-1.5 py-0.5 text-amber-200"
                      : "rounded bg-blue-900/40 px-1.5 py-0.5 text-blue-200"
                  }
                >
                  {order.tripId == null
                    ? "Sin viaje"
                    : `Viaje #${order.tripId}`}
                </span>
                {order.driverName && (
                  <span className="text-gray-400">{order.driverName}</span>
                )}
              </span>
              <span className="flex items-center gap-3 text-gray-300">
                <span>{renderQuantity(order.quantity)}</span>
                <span>{order.lineCount} línea(s)</span>
              </span>
            </summary>
            <div className="border-t border-gray-800 px-2 py-1.5">
              <table className="w-full text-left text-[11px] text-gray-300">
                <thead className="text-gray-500">
                  <tr>
                    <th className="py-1 font-medium">Cliente</th>
                    <th className="py-1 font-medium">Negocio</th>
                    <th className="py-1 font-medium">Localidad</th>
                    <th className="py-1 text-right font-medium">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map((line) => (
                    <tr key={line.lineId} className="border-t border-gray-800">
                      <td className="py-1">{line.clientName}</td>
                      <td className="py-1">{line.businessName || "—"}</td>
                      <td className="py-1">{line.localityName || "—"}</td>
                      <td className="py-1 text-right">
                        {renderQuantity(line.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {order.excludedLineCount > 0 && (
                <p className="mt-1 text-[10px] text-amber-300">
                  {order.excludedLineCount} línea(s) ya vendida(s) excluida(s):{" "}
                  {formatUnits(order.excludedQuantity, unitType)}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </details>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      position="right"
      className="w-full max-w-3xl"
    >
      <DrawerHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Auditoría de disponibilidad
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              {startDate ? formatHumanDate(startDate) : "—"} —{" "}
              {endDate ? formatHumanDate(endDate) : "—"}
            </p>
          </div>
          <Button color="gray" size="xs" onClick={onClose}>
            <HiX className="h-4 w-4" />
          </Button>
        </div>
      </DrawerHeader>
      <DrawerItems>
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3">
              <p className="text-[10px] font-medium tracking-wider text-emerald-300 uppercase">
                Existencia en remesas
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                {renderQuantity(totalRemainingUnits)}
              </p>
              <p className="text-[11px] text-gray-400">
                {includedBatches.length} remesa(s) incluida(s)
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3">
              <p className="text-[10px] font-medium tracking-wider text-amber-300 uppercase">
                Pedidos pendientes
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                {isLoading
                  ? "Calculando..."
                  : renderQuantity(visiblePendingQuantity)}
              </p>
              <p className="text-[11px] text-gray-400">
                {visiblePendingLines} línea(s)
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3">
              <p className="text-[10px] font-medium tracking-wider text-blue-300 uppercase">
                Disponible después
              </p>
              <p
                className={`mt-1 text-xl font-bold ${
                  availableAfterOrders < 0 ? "text-red-300" : "text-white"
                }`}
              >
                {isLoading
                  ? "Calculando..."
                  : renderQuantity(availableAfterOrders)}
              </p>
              {availableAfterOrders < 0 && (
                <p className="text-[10px] font-semibold tracking-wide text-red-300 uppercase">
                  Sobrepedido
                </p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-gray-400">
            Las remesas se filtran por fecha de entrada. Los pedidos se filtran
            por fecha de pedido. Los pedidos ya vendidos en su viaje no se
            cuentan como pendientes.
          </p>

          {pendingWithoutTrip > 0 && (
            <Alert color="warning" className="text-xs">
              {pendingWithoutTrip} pedido(s) pendiente(s) no tienen viaje
              vinculado. Se cuentan como pendientes hasta generar sus ventas.
            </Alert>
          )}

          {isError && (
            <Alert color="failure" className="text-xs">
              No se pudo cargar el detalle de pedidos:{" "}
              {error instanceof Error ? error.message : "intenta de nuevo"}
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              size="xs"
              color={tab === "day" ? "blue" : "gray"}
              onClick={() => setTab("day")}
            >
              Por día
            </Button>
            <Button
              size="xs"
              color={tab === "batches" ? "blue" : "gray"}
              onClick={() => setTab("batches")}
            >
              Remesas
            </Button>
          </div>

          {tab === "day" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label
                    className="mb-1 block text-[10px] text-gray-400"
                    htmlFor="audit-route-filter"
                  >
                    Ruta
                  </label>
                  <Select
                    id="audit-route-filter"
                    sizing="sm"
                    value={routeFilter}
                    onChange={(event) => setRouteFilter(event.target.value)}
                  >
                    <option value="">Todas las rutas</option>
                    {routeOptions.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  size="xs"
                  color="light"
                  onClick={exportPending}
                  disabled={!data || data.days.length === 0}
                >
                  <HiDownload className="mr-1 h-4 w-4" />
                  Exportar pedidos
                </Button>
              </div>

              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : filteredDays.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No hay pedidos pendientes en el rango seleccionado.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredDays.map((day) => renderDay(day))}
                </div>
              )}

              {data && data.excludedLineCount > 0 && (
                <p className="text-[11px] text-gray-400">
                  {data.excludedLineCount} línea(s) excluida(s) por venta ya
                  generada: {formatUnits(data.excludedQuantity, unitType)}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button
                  size="xs"
                  color="light"
                  onClick={exportBatches}
                  disabled={batchRows.length === 0}
                >
                  <HiDownload className="mr-1 h-4 w-4" />
                  Exportar remesas
                </Button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900 text-gray-400">
                    <tr>
                      <th className="px-2 py-2 font-medium">Remesa</th>
                      <th className="px-2 py-2 font-medium">Entrada</th>
                      <th className="px-2 py-2 text-right font-medium">
                        Inicial
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Vendido
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Ajustes
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Restante
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {includedRows.map((row) => (
                      <tr
                        key={row.batch.id}
                        className="border-t border-gray-800"
                      >
                        <td className="px-2 py-1.5">#{row.batch.id}</td>
                        <td className="px-2 py-1.5">
                          {formatHumanDate(entryDateKey(row.batch))}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          {formatNumber(Number(row.batch.initialQuantity ?? 0))}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          {formatNumber(Number(row.batch.soldQuantity ?? 0))}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          {formatNumber(
                            Number(row.batch.adjustedQuantity ?? 0),
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          {formatNumber(batchQuantity(row.batch, unitType))}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          {row.batch.availableCost != null &&
                          Number(row.batch.availableCost) > 0
                            ? formatMXN(Number(row.batch.availableCost))
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                  Remesas no incluidas
                </h3>
                {excludedRows.length === 0 ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Todas las remesas del rango están incluidas.
                  </p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {excludedRows.map((row) => (
                      <div
                        key={row.batch.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-800 bg-gray-900/40 px-2 py-1.5 text-xs"
                      >
                        <span className="text-gray-300">
                          Remesa #{row.batch.id} ·{" "}
                          {formatHumanDate(entryDateKey(row.batch))}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="text-gray-400">
                            {formatUnits(
                              batchQuantity(row.batch, unitType),
                              unitType,
                            )}
                          </span>
                          <span className="rounded bg-amber-900/40 px-1.5 py-0.5 text-[10px] text-amber-200">
                            {row.reason}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DrawerItems>
    </Drawer>
  );
};
