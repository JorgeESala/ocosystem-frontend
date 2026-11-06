import { TextInput, Textarea } from "flowbite-react";
import { HiTrash } from "react-icons/hi";
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
}

const lastPrice = (row: RouteOrderDraftRow, unitType: RouteOrderUnitType) => {
  const value =
    unitType === "EGG" ? row.lastSalePricePerCarton : row.lastSalePricePerKg;
  return value != null && value > 0 ? formatMXN(value) : "—";
};

const quantityHeader = (unitType: RouteOrderUnitType) =>
  unitType === "EGG" ? "Huevo (casilleros)" : "Cabezas";

const priceHeader = (unitType: RouteOrderUnitType) =>
  unitType === "EGG" ? "Precio/casillero" : "Precio/kg";

export const RouteOrderTable: React.FC<Props> = ({
  unitType,
  rows,
  currentEggPricePerCarton,
  onChange,
  onRemove,
}) => {
  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-700 p-10 text-center text-sm text-gray-400">
        Esta ruta no tiene clientes activos. Puedes agregar un cliente
        registrado de otra ruta.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-gray-700 bg-slate-950/70">
      <table className="min-w-[1500px] text-left text-xs text-gray-300">
        <thead className="bg-slate-900/80 text-[10px] tracking-[0.12em] text-gray-400 uppercase">
          <tr>
            <th className="px-3 py-3">Cliente</th>
            <th className="px-3 py-3">Negocio</th>
            <th className="px-3 py-3">Localidad</th>
            <th className="px-3 py-3 text-right">{quantityHeader(unitType)}</th>
            <th className="px-3 py-3 text-right">Últ. vendido</th>
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
            <th className="px-3 py-3">Verduras</th>
            <th className="px-3 py-3">Condimentos</th>
            <th className="px-3 py-3">Abarrotes</th>
            <th className="px-3 py-3">Comentarios</th>
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const quantity =
              unitType === "EGG"
                ? toNumber(row.quantity)
                : toNumber(row.headCount);
            const unitPrice = toNumber(row.unitPrice);
            return (
              <tr key={row.key} className="border-t border-gray-800 align-top">
                <td className="px-3 py-2 font-medium text-white">
                  {row.clientName}
                  {row.added && (
                    <span className="ml-2 rounded bg-emerald-900/40 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                      Otra ruta
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{row.businessName || "—"}</td>
                <td className="px-3 py-2">{row.localityName || "—"}</td>
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
                    className="w-24"
                  />
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {lastPrice(row, unitType)}
                </td>
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
                    className="w-24"
                  />
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
                <td className="px-3 py-2">
                  <Textarea
                    rows={2}
                    value={row.comments}
                    onChange={(event) =>
                      onChange(row.clientId, {
                        comments: event.target.value,
                      })
                    }
                    className="min-w-[120px]"
                  />
                </td>
                <td className="px-3 py-2">
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
