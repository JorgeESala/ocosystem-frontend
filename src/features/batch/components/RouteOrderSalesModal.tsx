import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { HiRefresh } from "react-icons/hi";
import { useDrivers } from "@/features/employee/api/employees.queries";
import {
  useGenerateRouteOrderSales,
  useRouteOrderSaleCandidates,
} from "@/features/route-orders/api/routeOrders.queries";
import {
  roundMoney,
  toNumber,
} from "@/features/route-orders/utils/routeOrderCalc";
import type {
  GenerateRouteOrderSalesDTO,
  GenerateRouteOrderSalesResultDTO,
  RouteOrderSaleCandidateDTO,
} from "@/features/route-orders/types/routeOrder.types";
import { calculateEggUnits } from "@/utils/egg.utils";
import { formatHumanDate, toLocalDateString } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import type { BatchResponseDTO } from "../types.batch";

type UnitType = "EGG" | "LIVE_CHICKEN";

interface ActualValues {
  headCount: string;
  quantity: string;
  weight: string;
  kgSent: string;
  unitPrice: string;
}

interface RouteGroup {
  orderId: number;
  routeId: number;
  routeName: string;
  driverId: number | null;
  driverName: string | null;
  tripId: number | null;
  rows: RouteOrderSaleCandidateDTO[];
}

interface Props {
  batch: BatchResponseDTO;
  onClose: () => void;
}

const initialValues = (
  candidate: RouteOrderSaleCandidateDTO,
): ActualValues => ({
  headCount: candidate.headCount != null ? String(candidate.headCount) : "",
  quantity: candidate.quantity != null ? String(candidate.quantity) : "",
  weight: "",
  kgSent: "",
  unitPrice: String(candidate.unitPrice ?? 0),
});

const lineTotal = (
  values: ActualValues | undefined,
  unitType: UnitType,
): number => {
  if (!values) return 0;
  if (unitType === "EGG") {
    return roundMoney(toNumber(values.quantity) * toNumber(values.unitPrice));
  }
  return roundMoney(toNumber(values.weight) * toNumber(values.unitPrice));
};

const eggHint = (cartons: string): string => {
  const totalPieces = toNumber(cartons) * 30;
  if (totalPieces <= 0) return "";
  const {
    boxes,
    cartons: cartonCount,
    pieces,
  } = calculateEggUnits(totalPieces);
  return `${boxes} cajas · ${cartonCount} casilleros · ${pieces} piezas`;
};

export const RouteOrderSalesModal: React.FC<Props> = ({ batch, onClose }) => {
  const unitType: UnitType =
    batch.type === "LIVE_CHICKEN" ? "LIVE_CHICKEN" : "EGG";
  const [date, setDate] = useState(toLocalDateString(new Date()));
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [forced, setForced] = useState<Set<number>>(new Set());
  const [values, setValues] = useState<Record<number, ActualValues>>({});
  const [driverByOrder, setDriverByOrder] = useState<Record<number, number>>(
    {},
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateRouteOrderSalesResultDTO | null>(
    null,
  );
  const initializedDateRef = useRef<string | null>(null);

  const {
    data: candidates = [],
    isLoading,
    isError,
    isSuccess,
    isFetching,
    refetch,
  } = useRouteOrderSaleCandidates(date);
  const { data: drivers = [] } = useDrivers();
  const generateMutation = useGenerateRouteOrderSales();

  useEffect(() => {
    if (!isSuccess || initializedDateRef.current === date) return;
    initializedDateRef.current = date;
    setSelected(
      new Set(
        candidates
          .filter((candidate) => !candidate.alreadySold)
          .map((candidate) => candidate.lineId),
      ),
    );
    setValues(
      Object.fromEntries(
        candidates.map((candidate) => [
          candidate.lineId,
          initialValues(candidate),
        ]),
      ),
    );
    setForced(new Set());
    setDriverByOrder({});
    setSubmitError(null);
    setResult(null);
  }, [candidates, date, isSuccess]);

  const routeOptions = useMemo(
    () =>
      Array.from(
        new Map(
          candidates.map((candidate) => [
            candidate.routeId,
            candidate.routeName,
          ]),
        ).entries(),
      ).sort((left, right) => left[1].localeCompare(right[1], "es")),
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (routeFilter && String(candidate.routeId) !== routeFilter) {
        return false;
      }
      if (!term) return true;
      return [candidate.clientName, candidate.businessName, candidate.routeName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [candidates, routeFilter, search]);

  const groups = useMemo(() => {
    const map = new Map<number, RouteGroup>();
    for (const candidate of filteredCandidates) {
      const group =
        map.get(candidate.orderId) ??
        ({
          orderId: candidate.orderId,
          routeId: candidate.routeId,
          routeName: candidate.routeName,
          driverId: candidate.driverId,
          driverName: candidate.driverName,
          tripId: candidate.tripId,
          rows: [],
        } satisfies RouteGroup);
      group.rows.push(candidate);
      map.set(candidate.orderId, group);
    }
    return Array.from(map.values());
  }, [filteredCandidates]);

  const selectedCandidates = useMemo(
    () => candidates.filter((candidate) => selected.has(candidate.lineId)),
    [candidates, selected],
  );

  const selectedTotal = useMemo(
    () =>
      selectedCandidates.reduce(
        (sum, candidate) => sum + lineTotal(values[candidate.lineId], unitType),
        0,
      ),
    [selectedCandidates, unitType, values],
  );

  const selectable = (candidate: RouteOrderSaleCandidateDTO) =>
    !candidate.alreadySold || forced.has(candidate.lineId);

  const setLineValue = (lineId: number, patch: Partial<ActualValues>) => {
    setValues((previous) => ({
      ...previous,
      [lineId]: {
        ...(previous[lineId] ?? {
          headCount: "",
          quantity: "",
          weight: "",
          kgSent: "",
          unitPrice: "0",
        }),
        ...patch,
      },
    }));
  };

  const toggleSelected = (lineId: number) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  };

  const toggleForced = (candidate: RouteOrderSaleCandidateDTO) => {
    setForced((previous) => {
      const next = new Set(previous);
      if (next.has(candidate.lineId)) {
        next.delete(candidate.lineId);
        setSelected((current) => {
          const updated = new Set(current);
          updated.delete(candidate.lineId);
          return updated;
        });
      } else {
        next.add(candidate.lineId);
        setSelected((current) => {
          const updated = new Set(current);
          updated.add(candidate.lineId);
          return updated;
        });
      }
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected(
      new Set(
        filteredCandidates
          .filter(selectable)
          .map((candidate) => candidate.lineId),
      ),
    );
  };

  const clearAll = () => setSelected(new Set());

  const groupDriverId = (group: RouteGroup): number | null =>
    group.driverId ?? driverByOrder[group.orderId] ?? null;

  const selectGroup = (group: RouteGroup, checked: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous);
      for (const candidate of group.rows.filter(selectable)) {
        if (checked) next.add(candidate.lineId);
        else next.delete(candidate.lineId);
      }
      return next;
    });
  };

  const groupIsFullySelected = (group: RouteGroup): boolean => {
    const rows = group.rows.filter(selectable);
    return rows.length > 0 && rows.every((row) => selected.has(row.lineId));
  };

  const onSubmit = () => {
    setSubmitError(null);
    if (selectedCandidates.length === 0) {
      setSubmitError("Selecciona al menos un cliente.");
      return;
    }

    const lines: GenerateRouteOrderSalesDTO["lines"] = [];
    for (const candidate of selectedCandidates) {
      const current = values[candidate.lineId] ?? initialValues(candidate);
      const driverId = candidate.driverId ?? driverByOrder[candidate.orderId];
      if (!driverId) {
        setSubmitError(
          `Selecciona un chofer para la ruta ${candidate.routeName}.`,
        );
        return;
      }

      if (unitType === "EGG") {
        if (toNumber(current.quantity) <= 0) {
          setSubmitError(`Captura los casilleros de ${candidate.clientName}.`);
          return;
        }
        lines.push({
          orderId: candidate.orderId,
          lineId: candidate.lineId,
          driverId,
          force: forced.has(candidate.lineId),
          quantity: toNumber(current.quantity),
          unitPrice: toNumber(current.unitPrice),
          saleTotal: lineTotal(current, unitType),
        });
      } else {
        if (toNumber(current.headCount) <= 0) {
          setSubmitError(`Captura las cabezas de ${candidate.clientName}.`);
          return;
        }
        if (toNumber(current.weight) <= 0) {
          setSubmitError(
            `Captura los kilos vendidos de ${candidate.clientName}.`,
          );
          return;
        }
        if (toNumber(current.kgSent) <= 0) {
          setSubmitError(
            `Captura los kilos enviados de ${candidate.clientName}.`,
          );
          return;
        }
        lines.push({
          orderId: candidate.orderId,
          lineId: candidate.lineId,
          driverId,
          force: forced.has(candidate.lineId),
          headCount: toNumber(current.headCount),
          weight: toNumber(current.weight),
          kgSent: toNumber(current.kgSent),
          unitPrice: toNumber(current.unitPrice),
          saleTotal: lineTotal(current, unitType),
        });
      }
    }

    generateMutation.mutate(
      { batchId: batch.id, date, lines },
      {
        onSuccess: (response) => setResult(response),
        onError: (error: unknown) =>
          setSubmitError(
            error instanceof Error
              ? error.message
              : "No se pudieron generar las ventas",
          ),
      },
    );
  };

  return (
    <Modal show={true} onClose={onClose} size="7xl">
      <ModalHeader className="border-b border-gray-700 bg-gray-800 text-white">
        Generar ventas del pedido · Remesa #{batch.id}
      </ModalHeader>
      <ModalBody className="bg-gray-800">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-700 bg-gray-900/40 p-3">
            <div>
              <Label className="mb-1 block text-xs">Fecha de venta</Label>
              <Datepicker
                language="es-MX"
                value={new Date(`${date}T12:00:00`)}
                onChange={(next) => {
                  if (next) setDate(toLocalDateString(next));
                }}
              />
            </div>
            <div className="min-w-[180px] flex-1">
              <Label className="mb-1 block text-xs">Buscar cliente</Label>
              <TextInput
                sizing="sm"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cliente, negocio o ruta..."
              />
            </div>
            <div className="min-w-[180px]">
              <Label className="mb-1 block text-xs">Ruta</Label>
              <Select
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
              color="gray"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <HiRefresh className="mr-1 h-4 w-4" />
              {isFetching ? "Actualizando..." : "Actualizar"}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Button size="xs" color="light" onClick={selectAllVisible}>
                Seleccionar visibles
              </Button>
              <Button size="xs" color="gray" onClick={clearAll}>
                Quitar todos
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-300">
            <span>
              Seleccionados: <strong>{selectedCandidates.length}</strong> ·
              Total: <strong>{formatMXN(selectedTotal)}</strong>
            </span>
            <span className="text-xs text-gray-500">
              {formatHumanDate(date, "long")} · {batch.supplierName}
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="xl" />
            </div>
          ) : isError ? (
            <Alert color="failure">
              No se pudieron cargar los pedidos del día.
            </Alert>
          ) : filteredCandidates.length === 0 ? (
            <Alert color="warning">
              No hay pedidos con clientes para esta fecha y ruta.
            </Alert>
          ) : (
            <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
              <div className="grid grid-cols-12 gap-2 px-3 text-[10px] tracking-wider text-gray-500 uppercase">
                <div className="col-span-5">Cliente</div>
                <div className="col-span-1 text-right">Pedido</div>
                {unitType === "EGG" ? (
                  <>
                    <div className="col-span-2 text-center">Casilleros</div>
                    <div className="col-span-1 text-center">Precio</div>
                    <div className="col-span-2 text-right">Total</div>
                  </>
                ) : (
                  <>
                    <div className="col-span-1 text-center">Cabezas</div>
                    <div className="col-span-1 text-center">Kg vendidos</div>
                    <div className="col-span-1 text-center">Kg enviados</div>
                    <div className="col-span-1 text-center">Precio/kg</div>
                    <div className="col-span-1 text-right">Total</div>
                  </>
                )}
                <div className="col-span-1" />
              </div>
              {groups.map((group) => (
                <div
                  key={group.orderId}
                  className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-700 bg-gray-800/70 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={groupIsFullySelected(group)}
                        onChange={(event) =>
                          selectGroup(group, event.target.checked)
                        }
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {group.routeName}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {group.driverName ??
                            (groupDriverId(group)
                              ? drivers.find(
                                  (driver) =>
                                    driver.id === groupDriverId(group),
                                )?.name
                              : "Sin chofer")}
                          {group.tripId ? ` · Viaje #${group.tripId}` : ""}
                        </p>
                      </div>
                    </div>
                    {group.driverId == null && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-400">Chofer</Label>
                        <Select
                          sizing="sm"
                          value={driverByOrder[group.orderId] ?? ""}
                          onChange={(event) =>
                            setDriverByOrder((previous) => ({
                              ...previous,
                              [group.orderId]: Number(event.target.value),
                            }))
                          }
                        >
                          <option value="">Seleccionar...</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="divide-y divide-gray-800">
                    {group.rows.map((candidate) => {
                      const current =
                        values[candidate.lineId] ?? initialValues(candidate);
                      const disabled = !selectable(candidate);
                      const total = lineTotal(current, unitType);
                      return (
                        <div
                          key={candidate.lineId}
                          className={`grid grid-cols-12 items-center gap-2 px-3 py-2 ${
                            disabled ? "opacity-60" : ""
                          }`}
                        >
                          <div className="col-span-1">
                            <Checkbox
                              checked={selected.has(candidate.lineId)}
                              disabled={disabled}
                              data-testid={`select-${candidate.lineId}`}
                              onChange={() => toggleSelected(candidate.lineId)}
                            />
                          </div>
                          <div className="col-span-4 min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {candidate.clientName}
                            </p>
                            <p className="truncate text-[11px] text-gray-500">
                              {candidate.businessName || "—"}
                              {candidate.businessName && candidate.localityName
                                ? " · "
                                : ""}
                              {candidate.localityName || ""}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {candidate.isInternalBranch && (
                                <Badge color="info" size="xs">
                                  Sucursal
                                </Badge>
                              )}
                              {candidate.isInternalClient &&
                                !candidate.isInternalBranch && (
                                  <Badge color="success" size="xs">
                                    Cliente interno
                                  </Badge>
                                )}
                              {candidate.alreadySold && (
                                <Badge color="warning" size="xs">
                                  Ya vendido
                                </Badge>
                              )}
                              {forced.has(candidate.lineId) && (
                                <Badge color="purple" size="xs">
                                  Forzada
                                </Badge>
                              )}
                            </div>
                          </div>

                          {unitType === "EGG" ? (
                            <>
                              <div className="col-span-1 text-right text-xs text-gray-400">
                                {candidate.quantity ?? 0}
                              </div>
                              <div className="col-span-2">
                                <TextInput
                                  sizing="sm"
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={current.quantity}
                                  data-testid={`cartons-${candidate.lineId}`}
                                  onChange={(event) =>
                                    setLineValue(candidate.lineId, {
                                      quantity: event.target.value,
                                    })
                                  }
                                />
                                <p className="mt-0.5 text-[9px] text-gray-500">
                                  {eggHint(current.quantity)}
                                </p>
                              </div>
                              <div className="col-span-1">
                                <TextInput
                                  sizing="sm"
                                  type="number"
                                  min="0"
                                  step="0.0001"
                                  value={current.unitPrice}
                                  data-testid={`price-${candidate.lineId}`}
                                  onChange={(event) =>
                                    setLineValue(candidate.lineId, {
                                      unitPrice: event.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="col-span-2 text-right font-mono text-xs text-white">
                                {formatMXN(total)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="col-span-1 text-right text-xs text-gray-400">
                                {candidate.headCount ?? 0}
                              </div>
                              <div className="col-span-1">
                                <TextInput
                                  sizing="sm"
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={current.headCount}
                                  data-testid={`heads-${candidate.lineId}`}
                                  onChange={(event) =>
                                    setLineValue(candidate.lineId, {
                                      headCount: event.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="col-span-1">
                                <TextInput
                                  sizing="sm"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={current.weight}
                                  data-testid={`kg-${candidate.lineId}`}
                                  onChange={(event) => {
                                    const weight = event.target.value;
                                    setLineValue(candidate.lineId, {
                                      weight,
                                      ...(current.kgSent.trim()
                                        ? {}
                                        : { kgSent: weight }),
                                    });
                                  }}
                                />
                              </div>
                              <div className="col-span-1">
                                <TextInput
                                  sizing="sm"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={current.kgSent}
                                  data-testid={`kg-sent-${candidate.lineId}`}
                                  onChange={(event) =>
                                    setLineValue(candidate.lineId, {
                                      kgSent: event.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="col-span-1">
                                <TextInput
                                  sizing="sm"
                                  type="number"
                                  min="0"
                                  step="0.0001"
                                  value={current.unitPrice}
                                  data-testid={`price-${candidate.lineId}`}
                                  onChange={(event) =>
                                    setLineValue(candidate.lineId, {
                                      unitPrice: event.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="col-span-1 text-right font-mono text-xs text-white">
                                {formatMXN(total)}
                              </div>
                            </>
                          )}

                          <div className="col-span-1 text-right">
                            {candidate.alreadySold && (
                              <button
                                type="button"
                                onClick={() => toggleForced(candidate)}
                                className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/20"
                              >
                                {forced.has(candidate.lineId)
                                  ? "Quitar"
                                  : "Agregar otra"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result && (
            <Alert color={result.skippedCount > 0 ? "warning" : "success"}>
              Se generaron {result.createdCount} venta
              {result.createdCount === 1 ? "" : "s"} por{" "}
              {formatMXN(result.totalAmount)}.
              {result.skippedCount > 0
                ? ` Se omitieron ${result.skippedCount} cliente${
                    result.skippedCount === 1 ? "" : "s"
                  } porque ya tenían venta.`
                : ""}
            </Alert>
          )}

          {submitError && <Alert color="failure">{submitError}</Alert>}

          <div className="flex items-center justify-between gap-3 border-t border-gray-700 pt-4">
            <p className="text-xs text-gray-500">
              La remesa se toma de la pantalla actual. Para otra remesa, cierra
              y repite desde esa remesa.
            </p>
            <div className="flex gap-2">
              <Button color="gray" onClick={onClose}>
                {result ? "Cerrar" : "Cancelar"}
              </Button>
              {!result && (
                <Button
                  color="blue"
                  onClick={onSubmit}
                  disabled={
                    generateMutation.isPending ||
                    selectedCandidates.length === 0
                  }
                >
                  {generateMutation.isPending
                    ? "Generando..."
                    : `Generar ventas (${selectedCandidates.length})`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
