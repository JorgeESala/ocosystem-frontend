import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Checkbox,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import {
  HiDownload,
  HiLink,
  HiPlus,
  HiPrinter,
  HiSave,
  HiTrash,
} from "react-icons/hi";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useClients } from "@/core/client/api/client.queries";
import { useVehicles } from "@/core/vehicle/api/vehicle.queries";
import type { Client, VehicleResponseDTO } from "@/core/api/types";
import { formatMXN } from "@/utils/moneyNumbers";
import { useDrivers } from "@/features/employee/api/employees.queries";
import type { Employee } from "@/features/employee/types";
import {
  useTripsByRouteDate,
  useTripSales,
} from "@/features/trips/api/trips.queries";
import type { TripSummaryDTO } from "@/features/trips/types/trip.types";
import {
  formatHumanDate,
  getDayName,
  toLocalDateString,
} from "@/utils/date.utils";
import {
  useCreateRouteOrderTrip,
  useEggPriceReference,
  useLinkRouteOrderTrip,
  useRouteOrdersDay,
  useSaveRouteOrder,
  useUnlinkRouteOrderTrip,
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
  roundMoney,
  roundQuantity,
  rowHasOrderData,
  toNumber,
  updateDraftRow,
} from "../utils/routeOrderCalc";
import { downloadRouteOrdersExcel } from "../utils/routeOrderExcel";
import {
  loadHideEmptyOnPrint,
  saveHideEmptyOnPrint,
} from "../utils/routeOrderPreferences";
import {
  openRouteOrdersPrint,
  type RouteOrderPrintInput,
} from "../utils/routeOrderSheet";
import type {
  RouteOrderDTO,
  RouteOrderDraft,
  RouteOrderDraftRow,
  RouteOrderSheetDTO,
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
  const [hideEmptyOnPrint, setHideEmptyOnPrint] = useState<boolean>(() =>
    loadHideEmptyOnPrint(),
  );
  const [showLinkTripModal, setShowLinkTripModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [linkedTrip, setLinkedTrip] = useState<TripSummaryDTO | null>(null);

  const { slug } = useParams<{ slug: string }>();
  const dateString = toLocalDateString(selectedDate);
  const {
    data: sheets = [],
    isLoading,
    isFetching: isDayFetching,
    isError,
    error,
    refetch: refetchDay,
  } = useRouteOrdersDay(dateString);
  const {
    data: currentPrice,
    isLoading: isPriceLoading,
    isFetching: isPriceFetching,
  } = useEggPriceReference(dateString, unitType === "EGG");
  const { data: allClients = [] } = useClients();
  const { data: drivers = [], isLoading: isDriversLoading } = useDrivers();
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useVehicles();
  const { data: availableTrips = [], isLoading: isTripsLoading } =
    useTripsByRouteDate(unitType, selectedRouteId, dateString, {
      enabled: showLinkTripModal && selectedRouteId != null,
    });
  const saveMutation = useSaveRouteOrder();
  const createTripMutation = useCreateRouteOrderTrip();
  const linkTripMutation = useLinkRouteOrderTrip();
  const unlinkTripMutation = useUnlinkRouteOrderTrip();

  const selectedSheet =
    sheets.find((sheet) => sheet.route.id === selectedRouteId) ?? null;
  const linkedTripId = linkedTrip?.id ?? draft?.tripId ?? null;
  const { data: tripSales = [] } = useTripSales(unitType, linkedTripId, {
    enabled: linkedTripId != null,
  });

  useEffect(() => {
    setLinkedTrip(selectedSheet?.order.trip ?? null);
  }, [selectedSheet?.order.trip]);

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

  const actualTripTotals = useMemo(() => {
    let quantity = 0;
    let amount = 0;
    for (const sale of tripSales) {
      amount += toNumber(sale.saleTotal);
      quantity +=
        unitType === "EGG"
          ? toNumber(sale.quantity) / 30
          : toNumber(sale.kgSent ?? sale.weight ?? 0);
    }
    return {
      quantity: roundQuantity(quantity),
      amount: roundMoney(amount),
    };
  }, [tripSales, unitType]);

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

  const driverItems = useMemo<Employee[]>(() => {
    const activeDrivers = drivers.filter((driver) => driver.active !== false);
    const currentName = draft?.driverName;
    if (
      currentName &&
      !activeDrivers.some((driver) => driver.name === currentName)
    ) {
      return [
        ...activeDrivers,
        { id: -1, name: currentName, email: "", position: "", active: true },
      ];
    }
    return activeDrivers;
  }, [drivers, draft?.driverName]);

  const vehicleItems = useMemo<VehicleResponseDTO[]>(() => {
    const currentName = draft?.vehicleName;
    if (
      currentName &&
      !vehicles.some((vehicle) => vehicle.name === currentName)
    ) {
      return [...vehicles, { id: -1, name: currentName, fuelType: "GASOLINE" }];
    }
    return vehicles;
  }, [vehicles, draft?.vehicleName]);

  const selectedDriver =
    driverItems.find(
      (driver) =>
        (draft?.driverId != null && driver.id === draft.driverId) ||
        driver.name === draft?.driverName,
    ) ?? null;
  const selectedVehicle =
    vehicleItems.find(
      (vehicle) =>
        (draft?.vehicleId != null && vehicle.id === draft.vehicleId) ||
        vehicle.name === draft?.vehicleName,
    ) ?? null;

  const handleHideEmptyOnPrintChange = (checked: boolean) => {
    setHideEmptyOnPrint(checked);
    saveHideEmptyOnPrint(checked);
  };

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

  const ensureSavedOrder = async (): Promise<RouteOrderDraft | null> => {
    if (!draft) return null;
    if (draft.orderId != null && !isDirty) return draft;
    return persistDraft();
  };

  const applyTripResponse = (updated: RouteOrderDTO) => {
    setLinkedTrip(updated.trip ?? null);
    setDraft((previous) =>
      previous
        ? {
            ...previous,
            tripId: updated.tripId ?? null,
            driverId: updated.driverId ?? previous.driverId,
            driverName: updated.driverName ?? previous.driverName,
            vehicleId: updated.vehicleId ?? previous.vehicleId,
            vehicleName: updated.vehicleName ?? previous.vehicleName,
          }
        : previous,
    );
  };

  const handleCreateTrip = async () => {
    const current = await ensureSavedOrder();
    if (!current?.orderId) return;
    if (current.driverId == null) {
      setToast({
        type: "warning",
        text: "Selecciona un chofer registrado antes de crear el viaje.",
      });
      return;
    }
    try {
      const updated = await createTripMutation.mutateAsync(current.orderId);
      applyTripResponse(updated);
      setToast({
        type: "success",
        text: "Viaje creado y vinculado al pedido.",
      });
      await refetchDay();
    } catch {
      setToast({
        type: "failure",
        text: "No se pudo crear el viaje. Intenta de nuevo.",
      });
    }
  };

  const handleLinkTrip = async () => {
    if (!selectedTripId) return;
    const current = await ensureSavedOrder();
    if (!current?.orderId) return;
    try {
      const updated = await linkTripMutation.mutateAsync({
        orderId: current.orderId,
        tripId: Number(selectedTripId),
      });
      applyTripResponse(updated);
      setShowLinkTripModal(false);
      setSelectedTripId("");
      setToast({ type: "success", text: "Viaje vinculado al pedido." });
      await refetchDay();
    } catch {
      setToast({
        type: "failure",
        text: "No se pudo vincular el viaje. Intenta de nuevo.",
      });
    }
  };

  const handleUnlinkTrip = async () => {
    if (!draft?.orderId) return;
    try {
      const updated = await unlinkTripMutation.mutateAsync(draft.orderId);
      applyTripResponse(updated);
      setToast({ type: "success", text: "Viaje desvinculado del pedido." });
      await refetchDay();
    } catch {
      setToast({
        type: "failure",
        text: "No se pudo desvincular el viaje. Intenta de nuevo.",
      });
    }
  };

  const buildPrintInput = (
    sheet: RouteOrderSheetDTO,
    sheetDraft: RouteOrderDraft,
  ): RouteOrderPrintInput => ({
    unitType,
    routeName: sheet.route.name,
    date: dateString,
    driverName: sheetDraft.driverName,
    vehicleName: sheetDraft.vehicleName,
    currentEggPricePerCarton: currentPrice?.pricePerCarton ?? null,
    currentEggPricePerBox: currentPrice?.pricePerBox ?? null,
    currentEggPriceEffectiveFrom: currentPrice?.effectiveFrom ?? null,
    hideEmptyRows: hideEmptyOnPrint,
    tripId: sheetDraft.tripId ?? null,
    draft: sheetDraft,
  });

  const buildDayInputs = (
    currentDraft: RouteOrderDraft | null,
  ): RouteOrderPrintInput[] =>
    sheets
      .map((sheet) => {
        const sheetDraft =
          currentDraft && sheet.route.id === currentDraft.routeId
            ? currentDraft
            : buildDraft(sheet, unitType, currentPrice?.pricePerCarton ?? null);
        return { sheet, sheetDraft };
      })
      .filter(({ sheetDraft }) => sheetDraft.rows.length > 0)
      .filter(
        ({ sheetDraft }) =>
          !hideEmptyOnPrint ||
          sheetDraft.rows.some((row) => rowHasOrderData(row)),
      )
      .map(({ sheet, sheetDraft }) => buildPrintInput(sheet, sheetDraft));

  const handlePrintRoute = async () => {
    if (!draft || !selectedSheet) return;
    setIsPrinting(true);
    const nextDraft = isDirty ? await persistDraft() : draft;
    setIsPrinting(false);
    if (!nextDraft) return;
    if (
      hideEmptyOnPrint &&
      !nextDraft.rows.some((row) => rowHasOrderData(row))
    ) {
      setToast({
        type: "warning",
        text: "No hay clientes con pedido para imprimir en esta ruta.",
      });
      return;
    }

    openRouteOrdersPrint([buildPrintInput(selectedSheet, nextDraft)]);
  };

  const handlePrintAll = async () => {
    if (sheets.length === 0) return;
    setIsPrinting(true);
    const currentDraft = isDirty && draft ? await persistDraft() : draft;
    setIsPrinting(false);
    if (isDirty && !currentDraft) return;

    const inputs = buildDayInputs(currentDraft);
    if (inputs.length === 0) {
      setToast({
        type: "warning",
        text: hideEmptyOnPrint
          ? "No hay rutas con clientes con pedido para imprimir en este día."
          : "No hay rutas con clientes para imprimir en este día.",
      });
      return;
    }
    openRouteOrdersPrint(inputs);
  };

  const handleExportRoute = async () => {
    if (!draft || !selectedSheet) return;
    const nextDraft = isDirty ? await persistDraft() : draft;
    if (!nextDraft) return;
    if (
      hideEmptyOnPrint &&
      !nextDraft.rows.some((row) => rowHasOrderData(row))
    ) {
      setToast({
        type: "warning",
        text: "No hay clientes con pedido para exportar en esta ruta.",
      });
      return;
    }
    try {
      await downloadRouteOrdersExcel(
        [buildPrintInput(selectedSheet, nextDraft)],
        `pedido-${slug ?? "ruta"}-${dateString}.xlsx`,
      );
    } catch {
      setToast({
        type: "failure",
        text: "No se pudo generar el Excel. Intenta de nuevo.",
      });
    }
  };

  const handleExportAll = async () => {
    if (sheets.length === 0) return;
    const currentDraft = isDirty && draft ? await persistDraft() : draft;
    if (isDirty && !currentDraft) return;
    const inputs = buildDayInputs(currentDraft);
    if (inputs.length === 0) {
      setToast({
        type: "warning",
        text: hideEmptyOnPrint
          ? "No hay rutas con clientes con pedido para exportar en este día."
          : "No hay rutas con clientes para exportar en este día.",
      });
      return;
    }
    try {
      await downloadRouteOrdersExcel(
        inputs,
        `pedidos-${slug ?? "rutas"}-${dateString}.xlsx`,
      );
    } catch {
      setToast({
        type: "failure",
        text: "No se pudo generar el Excel. Intenta de nuevo.",
      });
    }
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
          <Button
            color="light"
            onClick={handleExportAll}
            disabled={sheets.length === 0}
          >
            <HiDownload className="mr-2 h-4 w-4" />
            Excel todas las rutas
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
          <Button color="light" onClick={handleExportRoute} disabled={!draft}>
            <HiDownload className="mr-2 h-4 w-4" />
            Excel ruta
          </Button>
          {isDirty && (
            <span className="text-xs text-amber-300">Cambios sin guardar</span>
          )}
          <label className="flex w-full items-center gap-2 text-xs text-slate-300">
            <Checkbox
              checked={hideEmptyOnPrint}
              onChange={(event) =>
                handleHideEmptyOnPrintChange(event.target.checked)
              }
            />
            Ocultar clientes sin pedido al imprimir
          </label>
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
              <SearchableSelect
                inputId="order-driver"
                items={driverItems}
                selected={selectedDriver}
                onChange={(driver) => {
                  const name = driver?.name ?? "";
                  const id = driver && driver.id > 0 ? driver.id : null;
                  setDraft((previous) =>
                    previous
                      ? { ...previous, driverId: id, driverName: name }
                      : previous,
                  );
                  setIsDirty(true);
                }}
                getValue={(driver) => driver.id}
                getLabel={(driver) => driver.name}
                getSubtitle={(driver) => driver.email}
                placeholder={
                  isDriversLoading
                    ? "Cargando choferes..."
                    : "Sin chofer (opcional)"
                }
                emptyMessage="No se encontraron choferes"
                disabled={isDriversLoading || draft.tripId != null}
              />
            </div>
            <div>
              <Label htmlFor="order-vehicle">Vehículo (opcional)</Label>
              <SearchableSelect
                inputId="order-vehicle"
                items={vehicleItems}
                selected={selectedVehicle}
                onChange={(vehicle) => {
                  const name = vehicle?.name ?? "";
                  const id = vehicle && vehicle.id > 0 ? vehicle.id : null;
                  setDraft((previous) =>
                    previous
                      ? { ...previous, vehicleId: id, vehicleName: name }
                      : previous,
                  );
                  setIsDirty(true);
                }}
                getValue={(vehicle) => vehicle.id}
                getLabel={(vehicle) => vehicle.name}
                placeholder={
                  isVehiclesLoading
                    ? "Cargando vehículos..."
                    : "Sin vehículo (opcional)"
                }
                emptyMessage="No se encontraron vehículos"
                disabled={isVehiclesLoading || draft.tripId != null}
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

          {draft.tripId != null && (
            <p className="text-xs text-amber-300">
              Este pedido está vinculado a un viaje. Desvincula el viaje para
              cambiar chofer o vehículo.
            </p>
          )}

          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Viaje / Despacho
                </p>
                {linkedTrip ? (
                  <>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Viaje #{linkedTrip.id} ·{" "}
                      {linkedTrip.driverName ?? "Sin chofer"} ·{" "}
                      {linkedTrip.vehicleName ?? "Sin vehículo"}
                    </p>
                    <span className="mt-1 inline-block rounded bg-blue-900/40 px-2 py-0.5 text-[11px] text-blue-200">
                      {Number(linkedTrip.salesCount) > 0
                        ? "Con ventas"
                        : "Planificado"}
                    </span>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-300">
                    Este pedido todavía no está vinculado a un viaje.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {linkedTrip ? (
                  <Button
                    size="xs"
                    color="light"
                    onClick={handleUnlinkTrip}
                    disabled={unlinkTripMutation.isPending}
                  >
                    <HiTrash className="mr-1 h-4 w-4" />
                    Desvincular
                  </Button>
                ) : (
                  <>
                    <Button
                      size="xs"
                      color="blue"
                      onClick={handleCreateTrip}
                      disabled={
                        createTripMutation.isPending || draft.driverId == null
                      }
                    >
                      <HiLink className="mr-1 h-4 w-4" />
                      Crear viaje desde pedido
                    </Button>
                    <Button
                      size="xs"
                      color="light"
                      onClick={() => {
                        setSelectedTripId("");
                        setShowLinkTripModal(true);
                      }}
                    >
                      Vincular viaje existente
                    </Button>
                  </>
                )}
              </div>
            </div>

            {linkedTrip && totals && (
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3 md:grid-cols-4">
                <div>
                  <p className="text-[11px] text-slate-400">Pedido</p>
                  <p className="text-sm text-white">
                    {totals.totalQuantity}{" "}
                    {unitType === "EGG" ? "casilleros" : "kg"} ·{" "}
                    {formatMXN(totals.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Ventas</p>
                  <p className="text-sm text-white">
                    {actualTripTotals.quantity}{" "}
                    {unitType === "EGG" ? "casilleros" : "kg"} ·{" "}
                    {formatMXN(actualTripTotals.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Diferencia</p>
                  <p
                    className={`text-sm ${
                      actualTripTotals.amount - totals.totalAmount < 0
                        ? "text-red-300"
                        : "text-emerald-300"
                    }`}
                  >
                    {formatMXN(actualTripTotals.amount - totals.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Estado</p>
                  <p className="text-sm text-white">
                    {Number(linkedTrip.salesCount) > 0
                      ? "Con ventas"
                      : "Planificado"}
                  </p>
                </div>
              </div>
            )}
            {linkedTrip && (
              <p className="mt-2 text-[11px] text-slate-500">
                Las ventas se administran en Entradas y Ventas. Este pedido
                queda como referencia de lo planificado.
              </p>
            )}
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

      <Modal
        show={showLinkTripModal}
        size="md"
        onClose={() => setShowLinkTripModal(false)}
      >
        <ModalHeader>Vincular viaje existente</ModalHeader>
        <ModalBody>
          <p className="mb-3 text-sm text-slate-300">
            Selecciona un viaje de la misma ruta y fecha para este pedido.
          </p>
          {isTripsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : availableTrips.length === 0 ? (
            <Alert color="warning">
              No hay viajes registrados para esta ruta y fecha. Puedes crear uno
              desde el pedido.
            </Alert>
          ) : (
            <Select
              value={selectedTripId}
              onChange={(event) => setSelectedTripId(event.target.value)}
            >
              <option value="">Selecciona un viaje</option>
              {availableTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  Viaje #{trip.id} · {trip.driverName ?? "Sin chofer"} ·{" "}
                  {trip.vehicleName ?? "Sin vehículo"} ·{" "}
                  {Number(trip.salesCount) > 0 ? "Con ventas" : "Planificado"}
                </option>
              ))}
            </Select>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="gray"
            onClick={() => setShowLinkTripModal(false)}
            disabled={linkTripMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            color="blue"
            onClick={handleLinkTrip}
            disabled={!selectedTripId || linkTripMutation.isPending}
          >
            {linkTripMutation.isPending ? "Vinculando..." : "Vincular viaje"}
          </Button>
        </ModalFooter>
      </Modal>

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
