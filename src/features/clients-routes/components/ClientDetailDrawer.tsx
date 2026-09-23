import {
  Alert,
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Spinner,
} from "flowbite-react";
import { FaWhatsapp } from "react-icons/fa";
import { HiClock, HiPencil } from "react-icons/hi";
import { useClientPurchases } from "@/core/client/api/client.queries";
import type { Client, Route } from "@/core/api/types";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate, toLocalDateString } from "@/utils/date.utils";
import {
  monthToDateRange,
  type ClientsRoutesUnitType,
} from "../config/unitConfig";

interface ClientDetailDrawerProps {
  client: Client | null;
  routes: Route[];
  unitType: ClientsRoutesUnitType;
  onClose: () => void;
  onEdit: (clientId: number) => void;
  onHistory: (client: Client) => void;
}

const variationLabel = (pct: number | null | undefined): string => {
  if (pct == null) {
    return "—";
  }
  return `${pct >= 0 ? "↑" : "↓"} ${Math.abs(pct).toFixed(2)}%`;
};

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  client,
  routes,
  unitType,
  onClose,
  onEdit,
  onHistory,
}) => {
  const monthRange = monthToDateRange();
  const { data, isLoading, isError, error } = useClientPurchases(
    client?.id ?? null,
    toLocalDateString(monthRange.from),
    toLocalDateString(monthRange.to),
    "PREVIOUS_MONTH",
  );

  const quantityLabel = (quantity: number) =>
    unitType === "EGG"
      ? `${quantity.toLocaleString("es-MX")} piezas`
      : `${quantity.toLocaleString("es-MX")} aves`;

  return (
    <Drawer
      open={client !== null}
      onClose={onClose}
      position="right"
      className="w-[520px]"
    >
      <DrawerHeader title="Detalle de cliente" titleIcon={() => <></>} />
      <DrawerItems>
        {!client ? null : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {client.businessName ?? client.name}
              </h3>
              {client.businessName && (
                <p className="text-xs text-gray-500">{client.name}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-gray-300">
                  {client.isInternalBranch
                    ? "Sucursal"
                    : client.isInternalClient
                      ? "Cliente interno"
                      : "Externo"}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    client.active === false
                      ? "bg-gray-700 text-gray-300"
                      : "bg-emerald-900/50 text-emerald-200"
                  }`}
                >
                  {client.active === false ? "Inactivo" : "Activo"}
                </span>
                {client.localityName && (
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-gray-300">
                    {client.localityName}
                  </span>
                )}
                {routes.map((route) => (
                  <span
                    key={route.id}
                    className="rounded bg-blue-900/40 px-1.5 py-0.5 text-xs text-blue-200"
                  >
                    {route.name}
                  </span>
                ))}
              </div>
            </div>

            <dl className="space-y-1 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <dt className="text-gray-500">Teléfono:</dt>
                <dd className="flex items-center gap-2">
                  {client.phone ?? "—"}
                  {client.phone && (
                    <a
                      href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="WhatsApp"
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <FaWhatsapp size={16} />
                    </a>
                  )}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Dirección:</dt>
                <dd>{client.address ?? "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Última compra:</dt>
                <dd>
                  {client.lastPurchaseDate
                    ? formatHumanDate(client.lastPurchaseDate, "short")
                    : "—"}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2">
              <Button size="xs" color="light" onClick={() => onEdit(client.id)}>
                <HiPencil className="mr-1 h-4 w-4" />
                Editar
              </Button>
              <Button size="xs" color="light" onClick={() => onHistory(client)}>
                <HiClock className="mr-1 h-4 w-4" />
                Historial
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <Spinner size="md" />
              </div>
            ) : isError ? (
              <Alert color="failure">
                Error al cargar las compras del mes:{" "}
                {error instanceof Error ? error.message : "desconocido"}
              </Alert>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                  <p className="text-xs text-gray-400">Ventas del mes</p>
                  <p className="text-lg font-semibold text-blue-400">
                    {formatMXN(Number(data?.totalSales ?? 0))}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                  <p className="text-xs text-gray-400">Compras del mes</p>
                  <p className="text-lg font-semibold text-white">
                    {data?.saleCount ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                  <p className="text-xs text-gray-400">Cantidad</p>
                  <p className="text-lg font-semibold text-white">
                    {quantityLabel(Number(data?.totalQuantity ?? 0))}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                  <p className="text-xs text-gray-400">Var. ventas</p>
                  <p
                    className={`text-lg font-semibold ${
                      (data?.salesVariationPct ?? 0) >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {variationLabel(data?.salesVariationPct)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DrawerItems>
    </Drawer>
  );
};
