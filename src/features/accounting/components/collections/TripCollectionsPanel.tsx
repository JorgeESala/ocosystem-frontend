import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
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
  HiChevronDown,
  HiChevronUp,
  HiDocumentDownload,
  HiTruck,
} from "react-icons/hi";
import { useRoutes } from "@/core/api/route/routes.queries";
import { useCollectionAvailability } from "@/features/egg-cash-flow/api/eggCashFlow.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate, toLocalDateString } from "@/utils/date.utils";
import { useTripCollections } from "../../api/collections.queries";
import {
  useCreateBulkFifoPayments,
  useCreateFifoPayment,
} from "../../api/payments.queries";
import type {
  TripCollection,
  TripCollectionClient,
} from "../../types/collection.types";
import type { PaymentMethod } from "../../types/payment.types";
import { extractErrorMessage } from "../../utils/errorMessage";
import {
  openCollectionsSheet,
  openDayCollectionsSheet,
} from "../../utils/collectionsSheet";
import { AccountingErrorAlert } from "../AccountingErrorAlert";
import { AgingBadge } from "../AgingBadge";

interface Props {
  onSuccessToast?: (message: string) => void;
}

interface Draft {
  amount: string;
  cedisId: number | null;
}

interface ResultSummary {
  count: number;
  total: number;
  applied: number;
  parked: number;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia",
  DEPOSIT: "Depósito",
  CHECK: "Cheque",
  OTHER: "Otro",
};

const keyFor = (trip: TripCollection, client: TripCollectionClient) =>
  `${trip.tripId}:${client.clientId ?? client.clientName}`;

export const TripCollectionsPanel = ({ onSuccessToast }: Props) => {
  const [collectionDate, setCollectionDate] = useState<Date>(new Date());
  const [routeId, setRouteId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [expandedTripId, setExpandedTripId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ResultSummary | null>(null);
  const [confirmTrip, setConfirmTrip] = useState<TripCollection | null>(null);

  const { data: routes = [] } = useRoutes();
  const isoDate = toLocalDateString(collectionDate);
  const {
    data: trips = [],
    isLoading,
    isError,
    error: tripsError,
    refetch,
  } = useTripCollections(isoDate, isoDate, routeId);
  const createPayment = useCreateFifoPayment();
  const createBulkPayments = useCreateBulkFifoPayments();
  const {
    data: availability,
    isError: availabilityError,
    isLoading: availabilityLoading,
    refetch: refetchAvailability,
  } = useCollectionAvailability("EGG", isoDate);
  const verificationBlocked = availabilityError || availabilityLoading;

  const totalRows = useMemo(
    () =>
      trips.reduce(
        (sum, trip) =>
          sum +
          trip.clients.filter((client) => client.accountingEntityId != null)
            .length,
        0,
      ),
    [trips],
  );

  const draftFor = (trip: TripCollection, client: TripCollectionClient) => {
    const key = keyFor(trip, client);
    const existing = drafts[key];
    const saleCedis = client.saleCedisBalances?.[0];
    const deliveryCedis = saleCedis
      ? client.cedisBalances.find(
          (item) => item.creditorId === saleCedis.creditorId,
        )
      : null;
    const fallbackCedis = deliveryCedis ?? client.cedisBalances[0] ?? null;
    const cedisId = existing?.cedisId ?? fallbackCedis?.creditorId ?? null;
    const cedis =
      client.cedisBalances.find((item) => item.creditorId === cedisId) ??
      fallbackCedis;
    return {
      key,
      cedisId,
      cedis,
      amount: existing?.amount ?? "",
    };
  };

  const setDraftAmount = (
    trip: TripCollection,
    client: TripCollectionClient,
    amount: string,
  ) => {
    const draft = draftFor(trip, client);
    setDrafts((current) => ({
      ...current,
      [draft.key]: { amount, cedisId: draft.cedisId },
    }));
    setLastResult(null);
  };

  const setDraftCedis = (
    trip: TripCollection,
    client: TripCollectionClient,
    cedisId: number,
  ) => {
    const draft = draftFor(trip, client);
    setDrafts((current) => ({
      ...current,
      [keyFor(trip, client)]: { cedisId, amount: draft.amount },
    }));
    setLastResult(null);
  };

  const clearTripDrafts = (tripId: number) => {
    setDrafts((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([key]) => !key.startsWith(`${tripId}:`),
        ),
      ),
    );
  };

  const fillTripDrafts = (trip: TripCollection) => {
    const next = { ...drafts };
    trip.clients
      .filter(
        (client) => client.accountingEntityId != null && client.saldoTotal > 0,
      )
      .forEach((client) => {
        const draft = draftFor(trip, client);
        if (draft.cedisId != null) {
          next[draft.key] = {
            amount: String(client.saldoTotal),
            cedisId: draft.cedisId,
          };
        }
      });
    setDrafts(next);
    setLastResult(null);
  };

  const rowsToSave = (trip: TripCollection) =>
    trip.clients
      .filter((client) => client.accountingEntityId != null)
      .map((client) => ({ client, draft: draftFor(trip, client) }))
      .filter(({ draft }) => Number(draft.amount) > 0);

  const payloadFor = (
    trip: TripCollection,
    client: TripCollectionClient,
    draft: ReturnType<typeof draftFor>,
  ) => ({
    payerId: client.accountingEntityId!,
    receiverId: draft.cedisId!,
    amount: Number(draft.amount),
    paymentDate: isoDate,
    paymentMethod,
    tripId: trip.tripId,
  });

  const handleBulkSave = (trip: TripCollection) => {
    const rows = rowsToSave(trip);
    if (rows.length === 0 || verificationBlocked) return;
    setConfirmTrip(trip);
  };

  const confirmBulkSave = () => {
    if (!confirmTrip) return;
    const trip = confirmTrip;
    const rows = rowsToSave(trip);
    if (rows.length === 0 || verificationBlocked) {
      setConfirmTrip(null);
      return;
    }
    setError(null);
    setLastResult(null);
    createBulkPayments.mutate(
      rows.map(({ client, draft }) => payloadFor(trip, client, draft)),
      {
        onSuccess: (result) => {
          const summary = {
            count: result.created,
            total: rows.reduce((sum, row) => sum + Number(row.draft.amount), 0),
            applied: result.appliedTotal,
            parked: result.parkedTotal,
          };
          setLastResult(summary);
          onSuccessToast?.(
            `Se registraron ${summary.count} cobros por ${formatMXN(summary.total)} · aplicado ${formatMXN(summary.applied)} · saldo a favor ${formatMXN(summary.parked)}`,
          );
          clearTripDrafts(trip.tripId);
          setConfirmTrip(null);
          refetch();
        },
        onError: (mutationError) => {
          setError(extractErrorMessage(mutationError));
          setConfirmTrip(null);
        },
      },
    );
  };

  const handleRowSave = (
    trip: TripCollection,
    client: TripCollectionClient,
  ) => {
    const draft = draftFor(trip, client);
    if (Number(draft.amount) <= 0 || verificationBlocked) return;
    setError(null);
    setLastResult(null);
    createPayment.mutate(payloadFor(trip, client, draft), {
      onSuccess: (payment) => {
        const summary = {
          count: 1,
          total: payment.amount,
          applied: payment.appliedAmount ?? 0,
          parked: payment.remainingAmount ?? 0,
        };
        setLastResult(summary);
        onSuccessToast?.(
          `Cobro registrado · aplicado ${formatMXN(summary.applied)} · saldo a favor ${formatMXN(summary.parked)}`,
        );
        setDrafts((current) => {
          const next = { ...current };
          delete next[keyFor(trip, client)];
          return next;
        });
        refetch();
      },
      onError: (mutationError) => setError(extractErrorMessage(mutationError)),
    });
  };

  const handlePrint = (trip: TripCollection) => {
    openCollectionsSheet({
      routeName:
        `${trip.routeName ?? "Despacho"} · ${trip.driverName ?? ""}`.trim(),
      businessUnitName: "Huevo",
      dateLabel: formatHumanDate(trip.departureDate, "long"),
      rows: trip.clients.map((client) => ({
        displayName: client.clientName,
        entityType: client.accountingEntityId ? "Cliente" : "CASH",
        saldoRuta: client.saleTotal,
        saldoTotal: client.saldoTotal,
        phone: client.phone,
      })),
      totalRuta: trip.clients.reduce(
        (sum, client) => sum + client.saleTotal,
        0,
      ),
    });
  };

  const handlePrintDay = () => {
    openDayCollectionsSheet({
      businessUnitName: "Huevo",
      dateLabel: formatHumanDate(isoDate, "long"),
      trips: trips.map((trip) => ({
        routeName: trip.routeName ?? "Despacho",
        driverName: trip.driverName,
        vehicleName: trip.vehicleName,
        rows: trip.clients.map((client) => ({
          displayName: client.clientName,
          entityType: client.accountingEntityId ? "Cliente" : "CASH",
          saldoRuta: client.saleTotal,
          saldoTotal: client.saldoTotal,
          phone: client.phone,
        })),
        total: trip.clients.reduce((sum, client) => sum + client.saleTotal, 0),
      })),
    });
  };

  const confirmRows = confirmTrip ? rowsToSave(confirmTrip) : [];
  const confirmTotal = confirmRows.reduce(
    (sum, row) => sum + Number(row.draft.amount),
    0,
  );
  const confirmApplied = confirmRows.reduce(
    (sum, row) =>
      sum + Math.min(Number(row.draft.amount), row.draft.cedis?.balance ?? 0),
    0,
  );
  const confirmParked = Math.max(0, confirmTotal - confirmApplied);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="w-56">
          <Label htmlFor="trip-collection-date">Fecha</Label>
          <Datepicker
            id="trip-collection-date"
            language="es-MX"
            value={collectionDate}
            onChange={(value) => {
              if (value) {
                setCollectionDate(value);
                setExpandedTripId(null);
                setDrafts({});
                setLastResult(null);
              }
            }}
          />
        </div>
        <div className="w-64">
          <Label htmlFor="trip-collection-route">Ruta</Label>
          <Select
            id="trip-collection-route"
            value={routeId ?? ""}
            onChange={(event) => {
              setRouteId(
                event.target.value ? Number(event.target.value) : null,
              );
              setExpandedTripId(null);
              setDrafts({});
              setLastResult(null);
            }}
          >
            <option value="">Todas las rutas</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-56">
          <Label htmlFor="trip-collection-method">Método de pago</Label>
          <Select
            id="trip-collection-method"
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(event.target.value as PaymentMethod)
            }
          >
            {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((method) => (
              <option key={method} value={method}>
                {METHOD_LABELS[method]}
              </option>
            ))}
          </Select>
        </div>
        <Button
          size="sm"
          color="gray"
          disabled={trips.length === 0}
          onClick={handlePrintDay}
        >
          <HiDocumentDownload className="mr-2 h-4 w-4" />
          Imprimir día
        </Button>
        <p className="text-sm text-gray-400">
          {totalRows} cliente{totalRows === 1 ? "" : "s"} con cuenta por cobrar
        </p>
      </div>

      {availabilityError && (
        <Alert color="failure">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              No se pudo verificar el Flujo de efectivo. No se pueden guardar
              cobros hasta confirmarlo.
            </span>
            <Button
              size="xs"
              color="gray"
              onClick={() => refetchAvailability()}
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      {availability && !availability.writable && availability.message && (
        <Alert color="warning">{availability.message}</Alert>
      )}

      {error && (
        <Alert color="failure">
          <span className="font-medium">No se registraron los cobros.</span>{" "}
          {error}
        </Alert>
      )}

      {lastResult && (
        <Alert color="success">
          <span className="font-medium">
            Se registraron {lastResult.count} cobros por{" "}
            {formatMXN(lastResult.total)} · aplicado{" "}
            {formatMXN(lastResult.applied)} · saldo a favor{" "}
            {formatMXN(lastResult.parked)}
          </span>
        </Alert>
      )}

      {isError && (
        <AccountingErrorAlert
          error={tripsError}
          title="No se pudieron cargar los despachos"
          onRetry={() => refetch()}
        />
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && !isError && trips.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/30 p-8 text-center">
          <p className="text-sm text-gray-400">
            No hay despachos para esta fecha.
          </p>
        </div>
      )}

      {trips.map((trip) => {
        const expanded = expandedTripId === trip.tripId;
        const rows = rowsToSave(trip);
        const isSavingTrip =
          createBulkPayments.isPending ||
          createPayment.isPending ||
          verificationBlocked;
        return (
          <div
            key={trip.tripId}
            className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900/40"
          >
            <button
              type="button"
              className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-gray-800/40"
              onClick={() => setExpandedTripId(expanded ? null : trip.tripId)}
            >
              <div className="flex items-center gap-3">
                <HiTruck className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">
                    Chofer: {trip.driverName ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Ruta: {trip.routeName ?? "—"}
                    {trip.vehicleName ? ` · Camión: ${trip.vehicleName}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-5 text-right text-sm">
                <div>
                  <p className="text-[10px] tracking-wider text-gray-500 uppercase">
                    Ventas
                  </p>
                  <p className="font-semibold text-white">{trip.saleCount}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider text-gray-500 uppercase">
                    Total vendido
                  </p>
                  <p className="font-semibold text-white">
                    {formatMXN(trip.totalSold)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider text-gray-500 uppercase">
                    Contado
                  </p>
                  <p className="font-semibold text-amber-300">
                    {formatMXN(trip.cashOnlyTotal)}
                  </p>
                </div>
                {expanded ? (
                  <HiChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {expanded && (
              <div className="border-t border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 px-4 py-2">
                  <p className="text-xs text-gray-500">
                    {trip.departureDate
                      ? formatHumanDate(trip.departureDate, "short")
                      : ""}
                  </p>
                  <Button
                    size="xs"
                    color="gray"
                    onClick={() => handlePrint(trip)}
                  >
                    <HiDocumentDownload className="mr-1 h-3 w-3" />
                    Imprimir hoja
                  </Button>
                </div>

                <div className="divide-y divide-gray-800/70">
                  {trip.clients.map((client) => {
                    const draft = draftFor(trip, client);
                    const isCash = client.accountingEntityId == null;
                    const amount = Number(draft.amount);
                    return (
                      <div
                        key={keyFor(trip, client)}
                        className="grid items-center gap-3 px-4 py-3 text-sm lg:grid-cols-12"
                      >
                        <div className="lg:col-span-3">
                          <p className="font-medium text-white">
                            {client.clientName}
                            {isCash && (
                              <Badge
                                color="warning"
                                className="ml-2 inline-block"
                              >
                                Contado
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {client.phone ?? "Sin teléfono"}
                          </p>
                        </div>
                        <div className="lg:col-span-2">
                          <p className="text-[10px] tracking-wider text-gray-500 uppercase">
                            Venta
                          </p>
                          <p className="font-semibold text-white">
                            {formatMXN(client.saleTotal)}
                          </p>
                        </div>
                        <div className="lg:col-span-2">
                          <p className="text-[10px] tracking-wider text-gray-500 uppercase">
                            Saldo abierto
                          </p>
                          <p className="font-semibold text-white">
                            {isCash ? "—" : formatMXN(client.saldoTotal)}
                          </p>
                        </div>
                        <div className="lg:col-span-2">
                          <p className="text-[10px] tracking-wider text-gray-500 uppercase">
                            Antigüedad
                          </p>
                          {client.oldestDebtDate ? (
                            <AgingBadge isoDate={client.oldestDebtDate} />
                          ) : (
                            <span className="text-xs text-gray-500">—</span>
                          )}
                        </div>
                        {isCash ? (
                          <div className="text-xs text-gray-500 lg:col-span-3">
                            Su cobro se maneja en el flujo de efectivo.
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-end gap-2 lg:col-span-3">
                            {client.cedisBalances.length > 1 && (
                              <div className="w-32">
                                <Label
                                  htmlFor={`cedis-${keyFor(trip, client)}`}
                                >
                                  CEDIS
                                </Label>
                                <Select
                                  id={`cedis-${keyFor(trip, client)}`}
                                  sizing="sm"
                                  value={draft.cedisId ?? ""}
                                  onChange={(event) =>
                                    setDraftCedis(
                                      trip,
                                      client,
                                      Number(event.target.value),
                                    )
                                  }
                                >
                                  {client.cedisBalances.map((cedis) => (
                                    <option
                                      key={cedis.creditorId}
                                      value={cedis.creditorId}
                                    >
                                      {cedis.creditorName} ·{" "}
                                      {formatMXN(cedis.balance)}
                                    </option>
                                  ))}
                                </Select>
                              </div>
                            )}
                            <div className="w-28">
                              <Label htmlFor={`amount-${keyFor(trip, client)}`}>
                                Monto
                              </Label>
                              <TextInput
                                id={`amount-${keyFor(trip, client)}`}
                                type="number"
                                sizing="sm"
                                min={0}
                                step="0.01"
                                value={draft.amount}
                                disabled={
                                  !draft.cedis || draft.cedis.balance <= 0
                                }
                                onChange={(event) =>
                                  setDraftAmount(
                                    trip,
                                    client,
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                            <Button
                              size="xs"
                              color="gray"
                              disabled={amount <= 0 || isSavingTrip}
                              onClick={() => handleRowSave(trip, client)}
                            >
                              Cobrar
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {trip.clients.some(
                  (client) => client.accountingEntityId != null,
                ) && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-700 bg-gray-950/40 px-4 py-3">
                    <p className="text-xs text-gray-500">
                      {rows.length} cobro{rows.length === 1 ? "" : "s"} listo
                      {rows.length === 1 ? "" : "s"} para registrar
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="xs"
                        color="gray"
                        disabled={
                          createBulkPayments.isPending ||
                          createPayment.isPending
                        }
                        onClick={() => fillTripDrafts(trip)}
                      >
                        Usar saldos
                      </Button>
                      <Button
                        size="xs"
                        color="gray"
                        disabled={
                          createBulkPayments.isPending ||
                          createPayment.isPending
                        }
                        onClick={() => clearTripDrafts(trip.tripId)}
                      >
                        Limpiar
                      </Button>
                      <Button
                        disabled={rows.length === 0 || isSavingTrip}
                        onClick={() => handleBulkSave(trip)}
                      >
                        Registrar cobros ({rows.length})
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <Modal
        show={confirmTrip != null}
        size="lg"
        onClose={() => setConfirmTrip(null)}
      >
        <ModalHeader>Confirmar cobros</ModalHeader>
        <ModalBody>
          <p className="mb-4 text-sm text-gray-400">
            Revisa los montos antes de registrar los cobros del despacho.
          </p>
          <div className="space-y-2">
            {confirmRows.map(({ client, draft }) => {
              const amount = Number(draft.amount);
              const applied = Math.min(amount, draft.cedis?.balance ?? 0);
              return (
                <div
                  key={draft.key}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-700 p-3 text-sm"
                >
                  <span className="font-medium text-white">
                    {client.clientName}
                  </span>
                  <span className="text-gray-300">{formatMXN(amount)}</span>
                  <span className="text-xs text-gray-500">
                    Aplicado {formatMXN(applied)} · saldo a favor{" "}
                    {formatMXN(Math.max(0, amount - applied))}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg bg-gray-800 p-3 text-sm text-gray-200">
            Total: <strong>{formatMXN(confirmTotal)}</strong> · aplicado{" "}
            <strong>{formatMXN(confirmApplied)}</strong> · saldo a favor{" "}
            <strong>{formatMXN(confirmParked)}</strong>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setConfirmTrip(null)}>
            Cancelar
          </Button>
          <Button
            disabled={createBulkPayments.isPending || confirmRows.length === 0}
            onClick={confirmBulkSave}
          >
            Confirmar cobros ({confirmRows.length})
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
