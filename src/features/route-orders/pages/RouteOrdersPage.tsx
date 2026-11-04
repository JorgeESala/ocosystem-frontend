import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Datepicker,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { HiPlus, HiPrinter, HiSave } from "react-icons/hi";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useClients } from "@/core/client/api/client.queries";
import type { Client } from "@/core/api/types";
import {
  formatHumanDate,
  getDayName,
  toLocalDateString,
} from "@/utils/date.utils";
import {
  useEggPriceReference,
  useRouteOrdersDay,
  useSaveRouteOrder,
} from "../api/routeOrders.queries";
import { AddClientModal } from "../components/AddClientModal";
import { EggPriceHistoryModal } from "../components/EggPriceHistoryModal";
import { EggPriceModal } from "../components/EggPriceModal";
import { EggPriceReferenceCard } from "../components/EggPriceReferenceCard";
import { RouteOrderTable } from "../components/RouteOrderTable";
import { RouteOrderTotals } from "../components/RouteOrderTotals";
import {
  addClientToDraft,
  applyUnitPriceToDraft,
  buildDraft,
  computeTotals,
  draftToSavePayload,
  removeClientFromDraft,
  toNumber,
  updateDraftRow,
} from "../utils/routeOrderCalc";
import { openRouteOrdersPrint } from "../utils/routeOrderSheet";
import type {
  RouteOrderDraft,
  RouteOrderDraftRow,
  RouteOrderUnitType,
} from "../types/routeOrder.types";

interface Props {
  unitType: RouteOrderUnitType;
}

type ToastMessage = {
  type: "success" | "failure" | "warning";
  text: string;
};

const unitLabel = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Huevo" : "Pollo vivo";

export default function RouteOrdersPage({ unitType }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [draft, setDraft] = useState<RouteOrderDraft | null>(null);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingRouteId, setPendingRouteId] = useState<number | null>(null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [routePrice, setRoutePrice] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const dateString = toLocalDateString(selectedDate);
  const {
    data: sheets = [],
    isLoading,
    isFetching: isDayFetching,
    isError,
    error,
  } = useRouteOrdersDay(dateString);
  const {
    data: currentPrice,
    isLoading: isPriceLoading,
    isFetching: isPriceFetching,
  } = useEggPriceReference(dateString, unitType === "EGG");
  const { data: allClients = [] } = useClients();
  const saveMutation = useSaveRouteOrder();

  const selectedSheet =
    sheets.find((sheet) => sheet.route.id === selectedRouteId) ?? null;

  useEffect(() => {
    if (sheets.length === 0) {
      setSelectedRouteId(null);
      return;
    }
    if (
      selectedRouteId == null ||
      !sheets.some((sheet) => sheet.route.id === selectedRouteId)
    ) {
      setSelectedRouteId(sheets[0].route.id);
    }
  }, [sheets, selectedRouteId]);

  useEffect(() => {
    if (!selectedSheet) {
      setDraft(null);
      setDraftKey(null);
      return;
    }
    if (isDayFetching || isPriceFetching) {
      return;
    }
    const key = `${selectedSheet.route.id}-${dateString}`;
    if (key === draftKey) {
      return;
    }
    setDraft(
      buildDraft(selectedSheet, unitType, currentPrice?.pricePerCarton ?? null),
    );
    setDraftKey(key);
    setIsDirty(false);
  }, [
    selectedSheet,
    dateString,
    draftKey,
    unitType,
    isDayFetching,
    isPriceFetching,
    currentPrice,
  ]);

  useEffect(() => {
    setRoutePrice(currentPrice ? String(currentPrice.pricePerCarton) : "");
  }, [currentPrice]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const totals = useMemo(
    () => (draft ? computeTotals(draft.rows, unitType) : null),
    [draft, unitType],
  );

  const draftClientIds = useMemo(
    () => new Set((draft?.rows ?? []).map((row) => row.clientId)),
    [draft],
  );

  const addableClients = useMemo(
    () =>
      allClients.filter(
        (client) => client.active !== false && !draftClientIds.has(client.id),
      ),
    [allClients, draftClientIds],
  );

  const updateRow = (clientId: number, patch: Partial<RouteOrderDraftRow>) => {
    if (!draft) return;
    setDraft(updateDraftRow(draft, clientId, patch));
    setIsDirty(true);
  };

  const handleAddClient = (client: Client) => {
    if (!draft) return;
    setDraft(
      addClientToDraft(
        draft,
        client,
        unitType,
        currentPrice?.pricePerCarton ?? null,
      ),
    );
    setIsDirty(true);
    setShowAddClient(false);
  };

  const handleRemoveClient = (clientId: number) => {
    if (!draft) return;
    setDraft(removeClientFromDraft(draft, clientId));
    setIsDirty(true);
  };

  const handleApplyRoutePrice = () => {
    if (!draft) return;
    const price = toNumber(routePrice);
    if (price <= 0) {
      setToast({
        type: "warning",
        text: "Escribe un precio mayor a cero para aplicarlo a la ruta.",
      });
      return;
    }
    setDraft(applyUnitPriceToDraft(draft, price));
    setIsDirty(true);
  };

  const handleRouteChange = (nextRouteId: number) => {
    if (nextRouteId === selectedRouteId) return;
    if (isDirty) {
      setPendingRouteId(nextRouteId);
      return;
    }
    setSelectedRouteId(nextRouteId);
  };

  const handleDateChange = (nextDate: Date | null) => {
    if (!nextDate) return;
    if (isDirty) {
      setPendingDate(nextDate);
      return;
    }
    setSelectedDate(nextDate);
  };

  const confirmDiscard = () => {
    if (pendingRouteId != null) {
      setSelectedRouteId(pendingRouteId);
      setPendingRouteId(null);
    }
    if (pendingDate) {
      setSelectedDate(pendingDate);
      setPendingDate(null);
    }
    setIsDirty(false);
  };

  const persistDraft = async (): Promise<RouteOrderDraft | null> => {
    if (!draft) return null;
    try {
      const saved = await saveMutation.mutateAsync(draftToSavePayload(draft));
      const nextDraft = selectedSheet
        ? buildDraft(
            { ...selectedSheet, order: saved },
            unitType,
            currentPrice?.pricePerCarton ?? null,
          )
        : draft;
      setDraft(nextDraft);
      setDraftKey(`${saved.routeId}-${saved.orderDate}`);
      setIsDirty(false);
      setToast({ type: "success", text: "Pedido guardado." });
      return nextDraft;
    } catch {
      setToast({
        type: "failure",
        text: "No se pudo guardar el pedido. Intenta de nuevo.",
      });
      return null;
    }
  };

  const handleSave = async () => {
    await persistDraft();
  };

  const handlePrintRoute = async () => {
    if (!draft || !selectedSheet) return;
    setIsPrinting(true);
    const nextDraft = isDirty ? await persistDraft() : draft;
    setIsPrinting(false);
    if (!nextDraft) return;

    openRouteOrdersPrint([
      {
        unitType,
        routeName: selectedSheet.route.name,
        date: dateString,
        driverName: nextDraft.driverName,
        vehicleName: nextDraft.vehicleName,
        currentEggPricePerCarton: currentPrice?.pricePerCarton ?? null,
        currentEggPricePerBox: currentPrice?.pricePerBox ?? null,
        currentEggPriceEffectiveFrom: currentPrice?.effectiveFrom ?? null,
        draft: nextDraft,
      },
    ]);
  };

  const handlePrintAll = async () => {
    if (sheets.length === 0) return;
    setIsPrinting(true);
    const currentDraft = isDirty && draft ? await persistDraft() : draft;
    setIsPrinting(false);
    if (isDirty && !currentDraft) return;

    const inputs = sheets
      .filter(
        (sheet) => sheet.clients.length > 0 || sheet.order.lines.length > 0,
      )
      .map((sheet) => {
        const sheetDraft =
          currentDraft && sheet.route.id === currentDraft.routeId
            ? currentDraft
            : buildDraft(sheet, unitType, currentPrice?.pricePerCarton ?? null);
        return {
          unitType,
          routeName: sheet.route.name,
          date: dateString,
          driverName: sheetDraft.driverName,
          vehicleName: sheetDraft.vehicleName,
          currentEggPricePerCarton: currentPrice?.pricePerCarton ?? null,
          currentEggPricePerBox: currentPrice?.pricePerBox ?? null,
          currentEggPriceEffectiveFrom: currentPrice?.effectiveFrom ?? null,
          draft: sheetDraft,
        };
      });

    if (inputs.length === 0) {
      setToast({
        type: "warning",
        text: "No hay rutas con clientes para imprimir en este día.",
      });
      return;
    }
    openRouteOrdersPrint(inputs);
  };

  const dayName = getDayName(dateString);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pedidos</h1>
          <p className="text-sm text-slate-400">
            Hoja de pedidos por ruta para {unitLabel(unitType)}. Captura
            cantidades, precios y notas; guarda e imprime.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            color="light"
            onClick={handlePrintAll}
            disabled={sheets.length === 0 || isPrinting}
          >
            <HiPrinter className="mr-2 h-4 w-4" />
            Imprimir todas las rutas del día
          </Button>
        </div>
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-3">
        <div>
          <Label>Fecha</Label>
          <Datepicker
            language="es-MX"
            labelTodayButton="Hoy"
            labelClearButton="Limpiar"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>
        <div>
          <Label>Ruta</Label>
          <Select
            value={selectedRouteId ?? ""}
            onChange={(event) => handleRouteChange(Number(event.target.value))}
            disabled={sheets.length === 0}
          >
            {sheets.length === 0 && (
              <option value="">Sin rutas para este día</option>
            )}
            {sheets.map((sheet) => (
              <option key={sheet.route.id} value={sheet.route.id}>
                {sheet.route.name} ({sheet.clients.length} clientes)
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Button
            color="blue"
            onClick={handleSave}
            disabled={!draft || saveMutation.isPending}
          >
            <HiSave className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            color="light"
            onClick={handlePrintRoute}
            disabled={!draft || isPrinting}
          >
            <HiPrinter className="mr-2 h-4 w-4" />
            Imprimir ruta
          </Button>
          {isDirty && (
            <span className="text-xs text-amber-300">Cambios sin guardar</span>
          )}
        </div>
      </div>

      {toast && <Alert color={toast.type}>{toast.text}</Alert>}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : isError ? (
        <Alert color="failure">
          No se pudieron cargar los pedidos:{" "}
          {error instanceof Error ? error.message : "error desconocido"}
        </Alert>
      ) : sheets.length === 0 ? (
        <Alert color="warning">
          No hay rutas programadas para {dayName}{" "}
          {formatHumanDate(dateString, "long")}. Revisa los días de entrega en
          Clientes y Rutas.
        </Alert>
      ) : selectedSheet && draft && totals ? (
        <div className="space-y-4">
          {unitType === "EGG" ? (
            <EggPriceReferenceCard
              current={currentPrice}
              isLoading={isPriceLoading}
              routePrice={routePrice}
              onRoutePriceChange={setRoutePrice}
              onApplyRoutePrice={handleApplyRoutePrice}
              onOpenUpdate={() => setShowPriceModal(true)}
              onOpenHistory={() => setShowHistory(true)}
            />
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Precio para esta ruta
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Puedes aplicar un precio por kilo a todos los clientes y luego
                ajustar el que lo necesite.
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div>
                  <Label htmlFor="chicken-route-price">Precio por kilo</Label>
                  <TextInput
                    id="chicken-route-price"
                    type="number"
                    sizing="sm"
                    min="0"
                    step="0.01"
                    value={routePrice}
                    onChange={(event) => setRoutePrice(event.target.value)}
                    className="w-40"
                  />
                </div>
                <Button size="sm" color="blue" onClick={handleApplyRoutePrice}>
                  Aplicar a la ruta
                </Button>
              </div>
            </div>
          )}

          <RouteOrderTotals unitType={unitType} totals={totals} />

          <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-3">
            <div>
              <Label htmlFor="order-driver">Chofer (opcional)</Label>
              <TextInput
                id="order-driver"
                value={draft.driverName}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((previous) =>
                    previous ? { ...previous, driverName: value } : previous,
                  );
                  setIsDirty(true);
                }}
                placeholder="Nombre del chofer"
              />
            </div>
            <div>
              <Label htmlFor="order-vehicle">Vehículo (opcional)</Label>
              <TextInput
                id="order-vehicle"
                value={draft.vehicleName}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((previous) =>
                    previous ? { ...previous, vehicleName: value } : previous,
                  );
                  setIsDirty(true);
                }}
                placeholder="Camión, placas o número"
              />
            </div>
            <div>
              <Label htmlFor="order-notes">Notas del pedido</Label>
              <TextInput
                id="order-notes"
                value={draft.notes}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((previous) =>
                    previous ? { ...previous, notes: value } : previous,
                  );
                  setIsDirty(true);
                }}
                placeholder="Indicaciones generales de la ruta"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {selectedSheet.route.name}
              </h2>
              <p className="text-xs text-slate-400">
                {dayName.charAt(0).toUpperCase() + dayName.slice(1)}{" "}
                {formatHumanDate(dateString, "long")} ·{" "}
                {selectedSheet.clients.length} clientes en la ruta
              </p>
            </div>
            <Button
              size="sm"
              color="light"
              onClick={() => setShowAddClient(true)}
            >
              <HiPlus className="mr-2 h-4 w-4" />
              Agregar cliente
            </Button>
          </div>

          <RouteOrderTable
            unitType={unitType}
            rows={draft.rows}
            currentEggPricePerCarton={currentPrice?.pricePerCarton ?? null}
            onChange={updateRow}
            onRemove={handleRemoveClient}
          />

          <RouteOrderTotals unitType={unitType} totals={totals} />
        </div>
      ) : (
        <Alert color="warning">
          Selecciona una ruta para capturar el pedido.
        </Alert>
      )}

      <AddClientModal
        open={showAddClient}
        clients={addableClients}
        onClose={() => setShowAddClient(false)}
        onAdd={handleAddClient}
      />

      <EggPriceModal
        open={showPriceModal}
        current={currentPrice}
        onClose={() => setShowPriceModal(false)}
        onSaved={() =>
          setToast({ type: "success", text: "Precio actualizado." })
        }
      />

      <EggPriceHistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
      />

      <ConfirmDialog
        open={pendingRouteId != null || pendingDate != null}
        title="Cambios sin guardar"
        message="Si cambias de ruta o fecha, se perderán los cambios que no hayas guardado."
        confirmLabel="Descartar cambios"
        cancelLabel="Seguir editando"
        tone="danger"
        onConfirm={confirmDiscard}
        onClose={() => {
          setPendingRouteId(null);
          setPendingDate(null);
        }}
      />
    </div>
  );
}
