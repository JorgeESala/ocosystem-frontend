import { TextInput, Textarea } from "flowbite-react";
import { HiChevronDown, HiChevronUp, HiTrash } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import {
  CARTONS_PER_BOX,
  pricePerBox,
  roundUnitPrice,
  rowTotal,
  toNumber,
} from "../utils/routeOrderCalc";
import type {
  RouteOrderDraftRow,
  RouteOrderUnitType,
} from "../types/routeOrder.types";

interface Props {
  unitType: RouteOrderUnitType;
  rows: RouteOrderDraftRow[];
  currentEggPricePerCarton?: number | null;
  onChange: (clientId: number, patch: Partial<RouteOrderDraftRow>) => void;
  onRemove: (clientId: number) => void;
  onMove?: (clientId: number, direction: "up" | "down") => void;
  canMove?: (clientId: number, direction: "up" | "down") => boolean;
}

const lastPrice = (row: RouteOrderDraftRow, unitType: RouteOrderUnitType) => {
  const value =
    unitType === "EGG" ? row.lastSalePricePerCarton : row.lastSalePricePerKg;
  return value != null && value > 0 ? formatMXN(value) : "—";
};

const quantityHeader = (unitType: RouteOrderUnitType) =>
  unitType === "EGG" ? "Huevo (casilleros)" : "Pollo";

const priceHeader = (unitType: RouteOrderUnitType) =>
  unitType === "EGG" ? "Precio/casillero" : "Precio/kg";

export const RouteOrderTable: React.FC<Props> = ({
  unitType,
  rows,
  currentEggPricePerCarton,
  onChange,
  onRemove,
  onMove,
  canMove,
}) => {
  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-700 p-10 text-center text-sm text-gray-400">
        Esta ruta no tiene clientes activos. Puedes agregar un cliente
        registrado de otra ruta.
      </div>
    );
  }

  const liveChicken = unitType === "LIVE_CHICKEN";

  const moveControls = (row: RouteOrderDraftRow, index: number) =>
    onMove ? (
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          onClick={() => onMove(row.clientId, "up")}
          disabled={canMove ? !canMove(row.clientId, "up") : index === 0}
          aria-label={`Mover ${row.clientName} arriba`}
          data-testid={`move-up-${row.clientId}`}
          className="rounded p-0.5 text-gray-500 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
        >
          <HiChevronUp size={12} />
        </button>
        <button
          type="button"
          onClick={() => onMove(row.clientId, "down")}
          disabled={
            canMove ? !canMove(row.clientId, "down") : index === rows.length - 1
          }
          aria-label={`Mover ${row.clientName} abajo`}
          data-testid={`move-down-${row.clientId}`}
          className="rounded p-0.5 text-gray-500 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
        >
          <HiChevronDown size={12} />
        </button>
      </div>
    ) : null;

  return (
    <div className="overflow-x-auto rounded-3xl border border-gray-700 bg-slate-950/70">
      <table
        className={`text-left text-xs text-gray-300 ${
          liveChicken
            ? "w-full min-w-[1000px] table-fixed lg:min-w-0"
            : "min-w-[1500px]"
        }`}
      >
        {liveChicken && (
          <colgroup>
            <col style={{ width: "26%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "4%" }} />
          </colgroup>
        )}
        <thead className="bg-slate-900/80 text-[10px] tracking-[0.12em] text-gray-400 uppercase">
          <tr>
            <th className="px-3 py-3">Cliente</th>
            {!liveChicken && (
              <>
                <th className="px-3 py-3">Negocio</th>
                <th className="px-3 py-3">Localidad</th>
              </>
            )}
            <th className="px-3 py-3 text-right">{quantityHeader(unitType)}</th>
            {unitType === "LIVE_CHICKEN" && (
              <>
                <th className="px-3 py-3">Alimento</th>
                <th className="px-3 py-3">Huevo</th>
                <th className="px-3 py-3 text-right">Peso</th>
                <th className="px-3 py-3 text-right">Efectivo</th>
              </>
            )}
            {!liveChicken && (
              <th className="px-3 py-3 text-right">Últ. vendido</th>
            )}
            {unitType === "EGG" && (
              <th className="px-3 py-3 text-right">Precio actual</th>
            )}
            <th className="px-3 py-3 text-right">{priceHeader(unitType)}</th>
            {unitType === "EGG" && (
              <th className="px-3 py-3 text-right">Precio/caja</th>
            )}
            {unitType === "EGG" && (
              <th className="px-3 py-3 text-right">Total</th>
            )}
            {unitType === "EGG" && (
              <>
                <th className="px-3 py-3">Verduras</th>
                <th className="px-3 py-3">Condimentos</th>
                <th className="px-3 py-3">Abarrotes</th>
              </>
            )}
            <th className="px-3 py-3">Comentarios</th>
            <th className="px-3 py-3 text-center" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const quantity =
              unitType === "EGG"
                ? toNumber(row.quantity)
                : toNumber(row.headCount);
            const unitPrice = toNumber(row.unitPrice);
            const addedBadge = row.added ? (
              <span className="ml-2 rounded bg-emerald-900/40 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                Otra ruta
              </span>
            ) : null;
            return (
              <tr key={row.key} className="border-t border-gray-800 align-top">
                {liveChicken ? (
                  <td
                    className="px-3 py-2"
                    data-testid={`client-${row.clientId}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-white">
                          {row.clientName}
                          {addedBadge}
                        </div>
                        {(row.businessName || row.localityName) && (
                          <div className="mt-0.5 text-[10px] leading-4 font-normal text-gray-400">
                            {row.businessName && <div>{row.businessName}</div>}
                            {row.localityName && <div>{row.localityName}</div>}
                          </div>
                        )}
                      </div>
                      {moveControls(row, index)}
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="px-3 py-2 font-medium text-white">
                      <div className="flex items-start justify-between gap-2">
                        <span>
                          {row.clientName}
                          {addedBadge}
                        </span>
                        {moveControls(row, index)}
                      </div>
                    </td>
                    <td className="px-3 py-2">{row.businessName || "—"}</td>
                    <td className="px-3 py-2">{row.localityName || "—"}</td>
                  </>
                )}
                <td className="px-3 py-2">
                  <TextInput
                    type="number"
                    sizing="sm"
                    min="0"
                    step={unitType === "EGG" ? "0.001" : "1"}
                    value={unitType === "EGG" ? row.quantity : row.headCount}
                    data-testid={`quantity-${row.clientId}`}
                    onChange={(event) =>
                      onChange(
                        row.clientId,
                        unitType === "EGG"
                          ? { quantity: event.target.value }
                          : { headCount: event.target.value },
                      )
                    }
                    className={
                      liveChicken ? "w-full text-right tabular-nums" : "w-24"
                    }
                  />
                </td>
                {unitType === "LIVE_CHICKEN" && (
                  <>
                    <td className="px-3 py-2">
                      <TextInput
                        type="text"
                        sizing="sm"
                        maxLength={200}
                        value={row.feedText}
                        data-testid={`feed-${row.clientId}`}
                        onChange={(event) =>
                          onChange(row.clientId, {
                            feedText: event.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <TextInput
                        type="text"
                        sizing="sm"
                        maxLength={200}
                        value={row.eggText}
                        data-testid={`egg-${row.clientId}`}
                        onChange={(event) =>
                          onChange(row.clientId, {
                            eggText: event.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <TextInput
                        type="number"
                        sizing="sm"
                        min="0"
                        step="0.001"
                        value={row.weight}
                        data-testid={`weight-${row.clientId}`}
                        onChange={(event) =>
                          onChange(row.clientId, {
                            weight: event.target.value,
                          })
                        }
                        className="w-full text-right tabular-nums"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <TextInput
                        type="number"
                        sizing="sm"
                        min="0"
                        step="0.01"
                        value={row.cashAmount}
                        data-testid={`cash-${row.clientId}`}
                        onChange={(event) =>
                          onChange(row.clientId, {
                            cashAmount: event.target.value,
                          })
                        }
                        className="w-full text-right tabular-nums"
                      />
                    </td>
                  </>
                )}
                {!liveChicken && (
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {lastPrice(row, unitType)}
                  </td>
                )}
                {unitType === "EGG" && (
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {currentEggPricePerCarton != null &&
                    currentEggPricePerCarton > 0
                      ? formatMXN(currentEggPricePerCarton)
                      : "—"}
                  </td>
                )}
                <td className="px-3 py-2">
                  <TextInput
                    type="number"
                    sizing="sm"
                    min="0"
                    step="0.0001"
                    value={row.unitPrice}
                    data-testid={`unit-price-${row.clientId}`}
                    onChange={(event) =>
                      onChange(row.clientId, {
                        unitPrice: event.target.value,
                      })
                    }
                    className={
                      liveChicken ? "w-full text-right tabular-nums" : "w-24"
                    }
                  />
                  {liveChicken && (
                    <p className="mt-1 text-right text-[10px] whitespace-nowrap text-gray-400 tabular-nums">
                      Últ. {lastPrice(row, unitType)}
                    </p>
                  )}
                </td>
                {unitType === "EGG" && (
                  <td className="px-3 py-2">
                    <TextInput
                      type="number"
                      sizing="sm"
                      min="0"
                      step="0.01"
                      value={
                        unitPrice > 0 ? String(pricePerBox(unitPrice)) : ""
                      }
                      data-testid={`box-price-${row.clientId}`}
                      onChange={(event) => {
                        const boxPrice = toNumber(event.target.value);
                        onChange(row.clientId, {
                          unitPrice:
                            boxPrice > 0
                              ? String(
                                  roundUnitPrice(boxPrice / CARTONS_PER_BOX),
                                )
                              : "",
                        });
                      }}
                      className="w-24"
                    />
                  </td>
                )}
                {unitType === "EGG" && (
                  <td className="px-3 py-2 text-right font-medium whitespace-nowrap text-white">
                    {quantity > 0 ? formatMXN(rowTotal(row)) : "—"}
                  </td>
                )}
                {unitType === "EGG" && (
                  <>
                    <td className="px-3 py-2">
                      <Textarea
                        rows={2}
                        value={row.vegetables}
                        onChange={(event) =>
                          onChange(row.clientId, {
                            vegetables: event.target.value,
                          })
                        }
                        className="min-w-[120px]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Textarea
                        rows={2}
                        value={row.condiments}
                        onChange={(event) =>
                          onChange(row.clientId, {
                            condiments: event.target.value,
                          })
                        }
                        className="min-w-[110px]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Textarea
                        rows={2}
                        value={row.groceries}
                        onChange={(event) =>
                          onChange(row.clientId, {
                            groceries: event.target.value,
                          })
                        }
                        className="min-w-[110px]"
                      />
                    </td>
                  </>
                )}
                <td className="px-3 py-2">
                  <Textarea
                    rows={2}
                    value={row.comments}
                    onChange={(event) =>
                      onChange(row.clientId, {
                        comments: event.target.value,
                      })
                    }
                    className={liveChicken ? "w-full min-w-0" : "min-w-[120px]"}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  {row.added && (
                    <button
                      type="button"
                      onClick={() => onRemove(row.clientId)}
                      className="inline-flex items-center rounded-md bg-red-900/30 px-2 py-1 text-red-300 transition-colors hover:bg-red-800 hover:text-white"
                      title="Quitar cliente de esta hoja"
                    >
                      <HiTrash size={14} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
