import React, { useState } from "react";
import { Alert, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { useClientPurchases } from "@/core/client/api/client.queries";
import type { Client, ComparisonMode } from "@/core/api/types";
import { EggQuantityDisplay } from "@/features/batch/components/egg/EggQuantityDisplay";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate, toLocalDateString } from "@/utils/date.utils";
import { DateRangeFields } from "./DateRangeFields";
import {
  ClientHistoryHelpContent,
  InfoTooltip,
} from "./ClientsRoutesHelpContent";
import {
  monthToDateRange,
  type ClientsRoutesUnitType,
} from "../config/unitConfig";
import { previousRangeFor } from "../utils/comparison";

interface ClientHistoryModalProps {
  show: boolean;
  onClose: () => void;
  unitType: ClientsRoutesUnitType;
  client: Client | null;
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  show,
  onClose,
  unitType,
  client,
}) => {
  const [range, setRange] = useState<{ from: Date | null; to: Date | null }>(
    monthToDateRange,
  );
  const [comparison, setComparison] =
    useState<ComparisonMode>("PREVIOUS_MONTH");
  const from = range.from ? toLocalDateString(range.from) : null;
  const to = range.to ? toLocalDateString(range.to) : null;
  const { data, isLoading, isError, error } = useClientPurchases(
    client?.id ?? null,
    from,
    to,
    comparison,
  );
  const comparedRange =
    from && to ? previousRangeFor(from, to, comparison) : null;

  const sales = data?.sales ?? [];
  const quantityLabel = (quantity: number) =>
    unitType === "EGG" ? (
      <EggQuantityDisplay totalPieces={quantity} className="text-xs" />
    ) : (
      <span>{quantity.toLocaleString("es-MX")} aves</span>
    );

  return (
    <Modal show={show} size="3xl" popup onClose={onClose}>
      <ModalHeader>Historial de compras</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            {client?.name ?? ""}
            {client?.businessName ? (
              <span className="ml-2 text-xs text-gray-500">
                {client.businessName}
              </span>
            ) : null}
          </p>

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
              Error al cargar el historial:{" "}
              {error instanceof Error ? error.message : "desconocido"}
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                  <p className="text-xs text-gray-400">Ventas totales</p>
                  <p className="text-lg font-semibold text-green-400">
                    {formatMXN(Number(data?.totalSales ?? 0))}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                  <p className="text-xs text-gray-400">Cantidad</p>
                  <div className="text-lg font-semibold text-white">
                    {quantityLabel(Number(data?.totalQuantity ?? 0))}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                  <p className="text-xs text-gray-400">Compras</p>
                  <p className="text-lg font-semibold text-white">
                    {data?.saleCount ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    Última compra
                    <InfoTooltip
                      label="¿Qué muestra el historial?"
                      content={<ClientHistoryHelpContent />}
                    />
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {data?.lastPurchase
                      ? formatHumanDate(data.lastPurchase, "short")
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-700 bg-slate-900/40 p-3 text-sm text-gray-300">
                {comparedRange
                  ? `Vs ${formatHumanDate(comparedRange.from, "short")} – ${formatHumanDate(comparedRange.to, "short")}:`
                  : "Vs periodo anterior:"}{" "}
                <span
                  className={
                    (data?.salesVariationPct ?? 0) >= 0
                      ? "font-semibold text-emerald-400"
                      : "font-semibold text-red-400"
                  }
                >
                  {data?.salesVariationPct != null
                    ? `${data.salesVariationPct >= 0 ? "↑" : "↓"} ${Math.abs(Number(data.salesVariationPct)).toFixed(2)}%`
                    : "—"}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  ({formatMXN(Number(data?.previousTotalSales ?? 0))} antes)
                </span>
              </div>

              {sales.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-700 p-10 text-center text-sm text-gray-400">
                  Sin compras en el rango.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-700">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-gray-400 uppercase">
                      <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Ruta</th>
                        <th className="px-4 py-3">Cantidad</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id} className="border-t border-gray-800">
                          <td className="px-4 py-3">
                            {formatHumanDate(sale.saleDate, "short")}
                          </td>
                          <td className="px-4 py-3">
                            {sale.routeName ?? "Sin ruta"}
                          </td>
                          <td className="px-4 py-3">
                            {quantityLabel(Number(sale.quantity ?? 0))}
                          </td>
                          <td className="px-4 py-3 text-right text-green-400">
                            {formatMXN(Number(sale.saleTotal ?? 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};
