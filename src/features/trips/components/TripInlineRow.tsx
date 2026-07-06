import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Spinner, TextInput, Tooltip } from "flowbite-react";
import {
  HiArrowRight,
  HiCheck,
  HiChevronDown,
  HiChevronUp,
  HiExclamation,
  HiMap,
  HiPlus,
  HiTruck,
} from "react-icons/hi";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { EggQuantityDisplay } from "@/features/batch/components/egg/EggQuantityDisplay";
import { useCreateRoute, useRoutes } from "@/core/api/route/routes.queries";
import type { TripSaleDTO, TripsUnitType } from "../types/trip.types";
import {
  useCreateTrip,
  useTripSales,
  useTripSalesByDriverAndDate,
  useUpdateTrip,
} from "../api/trips.queries";
import { useBulkUpdateBatchSaleRoute } from "@/features/batch/api/batch.queries";
import { saleIsFromOtherBatch, type TripGroup } from "../utils/tripGrouping";

interface TripInlineRowProps {
  unitType: TripsUnitType;
  currentBatchId: number;
  group: TripGroup;
  defaultExpanded?: boolean;
  onEditMovement?: (mov: any) => void;
  renderSaleColumns: (sale: any, isOtherBatch: boolean) => React.ReactNode;
  renderHeaderColumns: () => React.ReactNode;
  renderOtherBatchHeader?: () => React.ReactNode;
  slug?: string;
  tripId?: number | null;
}

const formatKg = (kg: number | null | undefined) =>
  kg == null ? "-" : `${kg.toFixed(2)} kg`;

const isAdjustmentsGroup = (g: TripGroup) => g.key === "__adjustments__";
const isOrphanGroup = (g: TripGroup) => g.key === "__orphan_sales__";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function TripInlineRow({
  unitType,
  currentBatchId,
  group,
  defaultExpanded = false,
  onEditMovement,
  renderSaleColumns,
  renderHeaderColumns,
  renderOtherBatchHeader,
  slug,
  tripId: externalTripId,
}: TripInlineRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [kgDraft, setKgDraft] = useState<string>("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editError, setEditError] = useState<string | null>(null);
  const lastSavedValueRef = useRef<string>("");

  useEffect(() => {
    if (externalTripId != null && group.trip?.id === externalTripId && !expanded) {
      setExpanded(true);
    }
  }, [externalTripId, group.trip?.id, expanded]);

  const tripId = group.trip?.id ?? null;
  const fetchSales = !isAdjustmentsGroup(group);
  const { isLoading: salesLoading } = useTripSales(
    unitType,
    fetchSales ? tripId : null,
    { enabled: expanded && fetchSales && tripId != null },
  );

  const { data: allTripSales = [] } = useTripSalesByDriverAndDate(
    unitType,
    group.driverId,
    group.date,
    { enabled: expanded && fetchSales && group.driverId != null && group.date != null },
  );

  const updateMutation = useUpdateTrip(unitType);
  const createMutation = useCreateTrip(unitType);
  const bulkUpdateRouteMutation = useBulkUpdateBatchSaleRoute();

  const isEgg = unitType === "EGG";
  const [showRoutePicker, setShowRoutePicker] = useState(false);
  const { data: routes = [] } = useRoutes();
  const { mutate: createRoute, isPending: isCreatingRoute } = useCreateRoute();
  const [showNewRouteInput, setShowNewRouteInput] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");

  const saleIds = useMemo(
    () =>
      group.movements
        .filter((m) => m.type === "SALE")
        .map((m) => m.id)
        .filter((id): id is number => typeof id === "number"),
    [group.movements],
  );

  const handleAssignRouteToAll = (routeId: number) => {
    if (saleIds.length === 0) return;
    bulkUpdateRouteMutation.mutate(
      { saleIds, routeId },
      {
        onSuccess: () => setShowRoutePicker(false),
      },
    );
  };

  const handleCreateAndAssignRoute = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const name = newRouteName.trim();
    if (!name) return;
    createRoute(
      { name },
      {
        onSuccess: (savedRoute: any) => {
          setNewRouteName("");
          setShowNewRouteInput(false);
          handleAssignRouteToAll(savedRoute.id);
        },
      },
    );
  };

  useEffect(() => {
    if (saveState === "saving" || saveState === "saved") return;
    if (document.activeElement === inputRef.current) return;
    const serverValue =
      group.trip && group.trip.totalKgLoaded != null
        ? String(group.trip.totalKgLoaded)
        : "";
    if (serverValue === lastSavedValueRef.current) return;
    setKgDraft(serverValue);
    lastSavedValueRef.current = serverValue;
  }, [group.trip?.totalKgLoaded, group.trip?.id, saveState]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const otherBatchSales = useMemo<TripSaleDTO[]>(
    () =>
      (allTripSales as TripSaleDTO[]).filter((s) =>
        saleIsFromOtherBatch(s, currentBatchId),
      ),
    [allTripSales, currentBatchId],
  );

  const handleSaveKg = () => {
    if (group.driverId == null || !group.date) {
      setEditError("No se puede crear un despacho sin chofer o fecha.");
      setSaveState("error");
      return;
    }
    const value = kgDraft === "" ? null : Number(kgDraft);
    if (value != null && (Number.isNaN(value) || value < 0)) {
      setEditError("El valor debe ser numérico y positivo.");
      setSaveState("error");
      return;
    }
    if (value === null && group.trip == null) {
      setEditError(null);
      setSaveState("idle");
      return;
    }
    const currentServer = group.trip?.totalKgLoaded ?? null;
    if (value === currentServer) {
      setEditError(null);
      setSaveState("idle");
      return;
    }

    setEditError(null);
    setSaveState("saving");

    const finishOk = () => {
      const savedValue = value == null ? "" : String(value);
      lastSavedValueRef.current = savedValue;
      setKgDraft(savedValue);
      setSaveState("saved");
      window.setTimeout(() => {
        if (document.activeElement !== inputRef.current) {
          setSaveState("idle");
        }
      }, 1500);
    };
    const finishErr = (err: unknown) => {
      setSaveState("error");
      setEditError(
        (err as any)?.response?.data?.message ??
          (err as Error)?.message ??
          "No se pudo guardar el total cargado.",
      );
    };

    if (group.trip == null) {
      const kgForSource = value ?? 0;
      createMutation.mutate(
        {
          driverId: group.driverId,
          routeId: group.routeId ?? null,
          departureDate: group.date,
          totalKgLoaded: value,
          batchSources: [{ batchId: currentBatchId, kgLoaded: kgForSource }],
        },
        { onSuccess: finishOk, onError: finishErr },
      );
    } else {
      updateMutation.mutate(
        { id: group.trip.id, payload: { totalKgLoaded: value } },
        { onSuccess: finishOk, onError: finishErr },
      );
    }
  };

  if (isAdjustmentsGroup(group)) {
    return (
      <AdjustmentsSection
        group={group}
        expanded={expanded}
        setExpanded={setExpanded}
        onEditMovement={onEditMovement}
        unitType={unitType}
      />
    );
  }

  if (isOrphanGroup(group)) {
    return (
      <OrphanSalesSection
        group={group}
        expanded={expanded}
        setExpanded={setExpanded}
        onEditMovement={onEditMovement}
        renderSaleColumns={renderSaleColumns}
      />
    );
  }

  const trip = group.trip;
  const kgLoss =
    trip?.totalKgLoaded != null && trip.totalKgLoaded > 0
      ? Math.max(0, trip.totalKgLoaded - group.totals.kgSold)
      : null;

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/40">
      <div
        className="flex cursor-pointer items-center justify-between gap-3 p-3 transition hover:bg-slate-800/40"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-1 items-center gap-3">
          <HiTruck className="h-5 w-5 text-blue-400" />
          <div className="flex flex-col">
            <span className="font-semibold text-white">
              Despacho del {formatHumanDate(group.date, "short")}
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Chofer: {group.driverName ?? "—"}</span>
              <span>·</span>
              <span>
                Ruta: {group.routeName ?? "—"}
                {saleIds.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRoutePicker(!showRoutePicker);
                    }}
                    className="ml-2 inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/20"
                    title="Asignar la misma ruta a todas las ventas de este despacho"
                  >
                    <HiMap className="h-3 w-3" />
                    {showRoutePicker ? "Cancelar" : "Asignar a todas"}
                  </button>
                )}
              </span>
              {trip?.vehicleName && (
                <>
                  <span>·</span>
                  <span>Camión: {trip.vehicleName}</span>
                </>
              )}
            </div>
            {showRoutePicker && saleIds.length > 0 && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <HiMap className="h-4 w-4 text-blue-400" />
                  <select
                    defaultValue=""
                    disabled={
                      bulkUpdateRouteMutation.isPending ||
                      isCreatingRoute ||
                      showNewRouteInput
                    }
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      if (id) handleAssignRouteToAll(id);
                    }}
                    className="rounded border border-slate-600 bg-slate-700 px-2 py-1 text-xs text-white focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Selecciona una ruta…
                    </option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500">
                    ({saleIds.length} venta{saleIds.length === 1 ? "" : "s"})
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNewRouteInput(!showNewRouteInput);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                  >
                    <HiPlus className="h-3 w-3" />
                    {showNewRouteInput ? "Cancelar" : "Nueva ruta"}
                  </button>
                  {bulkUpdateRouteMutation.isPending && <Spinner size="sm" />}
                  {bulkUpdateRouteMutation.isError && (
                    <span className="text-[10px] text-red-400">
                      No se pudo asignar
                    </span>
                  )}
                </div>
                {showNewRouteInput && (
                  <form
                    onSubmit={handleCreateAndAssignRoute}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 pl-6"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={newRouteName}
                      onChange={(e) => setNewRouteName(e.target.value)}
                      placeholder="Nombre de la ruta (Ej. Vía Corta)..."
                      disabled={isCreatingRoute}
                      className="flex-1 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isCreatingRoute || !newRouteName.trim()}
                      className="rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isCreatingRoute ? "Creando…" : "Crear y asignar"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-right text-sm">
          <div>
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">
              Ventas
            </p>
            <p className="font-mono font-semibold text-white">
              {group.totals.salesCount}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">
              {isEgg ? "Piezas" : "Vendido"}
            </p>
            {isEgg ? (
              <EggQuantityDisplay totalPieces={group.totals.totalPieces} />
            ) : (
              <p className="font-mono font-semibold text-white">
                {formatKg(group.totals.kgSold)}
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">
              Enviado
            </p>
            <p className="font-mono text-slate-300">
              {formatKg(group.totals.kgSent)}
            </p>
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="min-w-[150px] text-right"
          >
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">
              KG cargado
            </p>
            <div className="flex items-center justify-end gap-1">
              <KgLoadedInput
                inputRef={inputRef}
                value={kgDraft}
                saveState={saveState}
                onChange={setKgDraft}
                onCommit={handleSaveKg}
              />
            </div>
          </div>
          {kgLoss != null && trip?.totalKgLoaded != null && (
            <div>
              <p className="text-[10px] tracking-wider text-slate-500 uppercase">
                Merma viaje
              </p>
              <p
                className={`font-mono font-semibold ${
                  kgLoss > 0 ? "text-orange-400" : "text-green-400"
                }`}
              >
                {kgLoss.toFixed(2)} kg
              </p>
            </div>
          )}
          <div className="text-slate-500">
            {expanded ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
          </div>
        </div>
      </div>

      {editError && (
        <div className="border-t border-slate-800 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {editError}
        </div>
      )}

      {expanded && (
        <div className="border-t border-slate-800">
          {salesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              {group.movements.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-500">
                  Aún no hay ventas registradas en este despacho.
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-12 items-center gap-2 border-b border-slate-800 bg-slate-950/40 px-3 py-1.5">
                    {renderHeaderColumns()}
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {group.movements.map((mov) => (
                      <div
                        key={`${mov.type}-${mov.id}`}
                        className="grid grid-cols-12 items-center gap-2 px-3 py-1.5 text-sm"
                      >
                        {renderSaleColumns(mov, false)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {otherBatchSales.length > 0 && (
                <div className="border-t border-slate-800 bg-slate-950/40 px-3 py-2">
                  <p className="text-[10px] tracking-wider text-slate-500 uppercase">
                    Ventas de otras remesas en este despacho (no se cuentan en
                    esta remesa)
                  </p>
                  {renderOtherBatchHeader && (
                    <div className="mt-2 grid grid-cols-12 items-center gap-2 border-b border-slate-800/60 pb-1">
                      {renderOtherBatchHeader()}
                    </div>
                  )}
                  <div className="mt-2 space-y-1">
                    {otherBatchSales.map((s) => {
                      const isEgg = unitType === "EGG";
                      const totalPieces = Number(s.quantity ?? 0) * 30;
                      const canNavigate =
                        s.batchId != null && slug != null && slug !== "";
                      return (
                        <div
                          key={s.id}
                          className="grid grid-cols-12 items-center gap-2 rounded border border-slate-800/70 bg-slate-900/30 px-2 py-1.5 text-xs text-slate-400"
                        >
                          <div className="col-span-3 truncate">
                            {canNavigate ? (
                              <Link
                                to={`/business/${slug}/salesAndBatches?batch=${s.batchId}${s.tripId != null ? `&tripId=${s.tripId}` : ""}`}
                                className="inline-flex max-w-full items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline"
                                title="Ir a la remesa"
                              >
                                <span className="truncate">
                                  {s.batchLabel ??
                                    `Remesa #${s.batchId}`}
                                </span>
                                <HiArrowRight className="h-3 w-3 flex-shrink-0" />
                              </Link>
                            ) : (
                              <span className="truncate">
                                {s.batchLabel ?? "Remesa"}
                              </span>
                            )}
                          </div>
                          <div className="col-span-3 truncate">
                            {s.clientName ?? "Venta directa"}
                          </div>
                          {isEgg ? (
                            <>
                              <div className="col-span-2 flex justify-center">
                                <EggQuantityDisplay totalPieces={totalPieces} />
                              </div>
                              <div className="col-span-2" />
                              <div className="col-span-2 text-right font-mono text-slate-300">
                                {formatMXN(Number(s.saleTotal))}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="col-span-2 text-right font-mono">
                                {formatKg(s.weight)}
                              </div>
                              <div className="col-span-2 text-right font-mono text-slate-500">
                                {s.kgSent != null
                                  ? `Env ${s.kgSent.toFixed(2)}`
                                  : "-"}
                              </div>
                              <div className="col-span-2 text-right font-mono text-slate-300">
                                {formatMXN(Number(s.saleTotal))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AdjustmentsSection({
  group,
  expanded,
  setExpanded,
  onEditMovement,
  unitType,
}: {
  group: TripGroup;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  onEditMovement?: (mov: any) => void;
  unitType: TripsUnitType;
}) {
  const isEgg = unitType === "EGG";

  const totals = useMemo(
    () =>
      group.movements.reduce(
        (acc, m) => {
          acc.count += 1;
          acc.kg += Number(m.weight || 0);
          acc.quantity += Number(m.quantity || 0);
          return acc;
        },
        { count: 0, kg: 0, quantity: 0 },
      ),
    [group.movements],
  );

  const dates = useMemo(
    () =>
      group.movements
        .map((m) => m.date)
        .filter(Boolean)
        .sort(),
    [group.movements],
  );
  const mostRecent = dates[dates.length - 1];
  const oldest = dates[0];

  const reasonCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of group.movements) {
      const reason = m.reason ?? "Otra";
      map[reason] = (map[reason] || 0) + 1;
    }
    return map;
  }, [group.movements]);
  const reasonText = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `${count}× ${reason}`)
    .join(" · ");

  const renderQuantity = (qty: number) =>
    isEgg ? <EggQuantityDisplay totalPieces={qty} /> : <>{qty} aves</>;

  return (
    <div className="rounded-xl border border-red-900/40 bg-red-950/10">
      <div
        className="flex cursor-pointer items-center justify-between gap-3 p-3 transition hover:bg-red-950/20"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-1 items-center gap-3">
          <span className="text-sm font-semibold text-red-300">
            Bajas / Ajustes ({totals.count})
          </span>
          {reasonText && (
            <span className="hidden truncate text-xs text-slate-500 md:inline">
              {reasonText}
            </span>
          )}
          {mostRecent && (
            <span className="hidden text-xs text-slate-500 lg:inline">
              ·{" "}
              {oldest && oldest !== mostRecent
                ? `${formatHumanDate(oldest, "short")} → ${formatHumanDate(mostRecent, "short")}`
                : formatHumanDate(mostRecent, "short")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-right text-sm">
          <div>
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">
              {isEgg ? "Cantidad" : "Aves"}
            </p>
            <p className="font-mono font-semibold text-red-300">
              {isEgg ? (
                <EggQuantityDisplay totalPieces={totals.quantity} />
              ) : (
                `${totals.quantity.toFixed(0)}`
              )}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">
              KG
            </p>
            <p className="font-mono font-semibold text-red-300">
              {totals.kg.toFixed(2)} kg
            </p>
          </div>
          <div className="text-slate-500">
            {expanded ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-red-900/40 px-3 py-2 text-xs text-red-200/80">
          {group.movements.length === 0 ? (
            <p className="py-2 text-slate-500">No hay bajas registradas.</p>
          ) : (
            <div className="divide-y divide-red-900/30">
              {group.movements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {m.reason ?? "Baja"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatHumanDate(m.date, "short")}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {renderQuantity(Number(m.quantity ?? 0))}
                  </div>
                  <div className="text-right font-mono text-sm">
                    {formatKg(m.weight)}
                  </div>
                  {onEditMovement && (
                    <button
                      type="button"
                      onClick={() => onEditMovement(m)}
                      className="rounded bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400"
                    >
                      Editar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrphanSalesSection({
  group,
  expanded,
  setExpanded,
  onEditMovement,
  renderSaleColumns,
}: {
  group: TripGroup;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  onEditMovement?: (mov: any) => void;
  renderSaleColumns: (sale: any, isOtherBatch: boolean) => React.ReactNode;
}) {
  return (
    <Tooltip content="Ventas sin chofer, ruta o fecha. Asignales una para vincularlas a un despacho.">
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/30">
        <div
          className="flex cursor-pointer items-center justify-between p-3 transition hover:bg-slate-800/40"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-300">
              Ventas sin despacho ({group.movements.length})
            </span>
          </div>
          <div className="text-slate-500">
            {expanded ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
          </div>
        </div>
        {expanded && (
          <div className="border-t border-slate-800">
            {group.movements.map((mov) => (
              <div
                key={`${mov.type}-${mov.id}`}
                className="grid grid-cols-12 items-center gap-2 px-3 py-2 text-sm"
              >
                {renderSaleColumns(mov, false)}
              </div>
            ))}
            {onEditMovement && group.movements.length > 0 && (
              <p className="px-3 pb-2 text-[11px] text-slate-500">
                Sugerencia: edita cada venta y asígnale un chofer + ruta + fecha
                para que se agrupe aquí.
              </p>
            )}
          </div>
        )}
      </div>
    </Tooltip>
  );
}

interface KgLoadedInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  saveState: SaveState;
  onChange: (next: string) => void;
  onCommit: () => void;
}

function KgLoadedInput({
  inputRef,
  value,
  saveState,
  onChange,
  onCommit,
}: KgLoadedInputProps) {
  const rightAdornment =
    saveState === "saving"
      ? () => <Spinner size="sm" />
      : saveState === "saved"
        ? () => <HiCheck className="h-4 w-4 text-green-400" />
        : saveState === "error"
          ? () => <HiExclamation className="h-4 w-4 text-red-400" />
          : undefined;

  return (
    <TextInput
      ref={inputRef}
      sizing="sm"
      type="number"
      step="0.001"
      min={0}
      placeholder="0.000"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLInputElement).blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
      color={
        saveState === "error"
          ? "failure"
          : saveState === "saved"
            ? "success"
            : undefined
      }
      className="w-32 text-right font-mono"
      rightIcon={rightAdornment}
    />
  );
}
