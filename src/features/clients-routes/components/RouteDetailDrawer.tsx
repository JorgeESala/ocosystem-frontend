import {
  Alert,
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Spinner,
} from "flowbite-react";
import { FaWhatsapp } from "react-icons/fa";
import { HiPencil, HiPlus, HiPrinter } from "react-icons/hi";
import {
  useRouteDetail,
  useRoutePerformance,
} from "@/core/api/route/routes.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate, toLocalDateString } from "@/utils/date.utils";
import { openRouteSheet } from "../utils/routeSheet";
import {
  monthToDateRange,
  weekdayShort,
  type ClientsRoutesUnitType,
} from "../config/unitConfig";
import { EggQuantityDisplay } from "@/features/batch/components/egg/EggQuantityDisplay";

interface RouteDetailDrawerProps {
  routeId: number | null;
  unitType: ClientsRoutesUnitType;
  onClose: () => void;
  onEdit: (routeId: number) => void;
  onAddClient: (localityId: number | null) => void;
}

const variationLabel = (pct: number | null | undefined): string => {
  if (pct == null) {
    return "—";
  }
  return `${pct >= 0 ? "↑" : "↓"} ${Math.abs(pct).toFixed(2)}%`;
};

export const RouteDetailDrawer: React.FC<RouteDetailDrawerProps> = ({
  routeId,
  unitType,
  onClose,
  onEdit,
  onAddClient,
}) => {
  const { data, isLoading, isError, error } = useRouteDetail(routeId);
  const monthRange = monthToDateRange();
  const { data: performance } = useRoutePerformance(
    toLocalDateString(monthRange.from),
    toLocalDateString(monthRange.to),
    "PREVIOUS_MONTH",
  );

  const route = data?.route;
  const row = (performance ?? []).find((item) => item.routeId === route?.id);
  const clients = data?.clients ?? [];

  const sheetLocalityId =
    route?.localityIds && route.localityIds.length === 1
      ? route.localityIds[0]
      : null;

  const quantityLabel = (quantity: number) =>
    unitType === "EGG" ? (
      <EggQuantityDisplay totalPieces={quantity} className="text-xs" />
    ) : (
      <span>{quantity.toLocaleString("es-MX")} aves</span>
    );

  return (
    <Drawer
      open={routeId !== null}
      onClose={onClose}
      position="right"
      className="w-[640px]"
    >
      <DrawerHeader title="Detalle de ruta" titleIcon={() => <></>} />
      <DrawerItems>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : isError || !route ? (
          <Alert color="failure">
            Error al cargar la ruta:{" "}
            {error instanceof Error ? error.message : "desconocido"}
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {route.name}
                {route.active === false && (
                  <span className="ml-2 rounded bg-gray-700 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300">
                    Inactiva
                  </span>
                )}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {(route.deliveryDays ?? []).map((day) => (
                  <span
                    key={day}
                    className="rounded bg-blue-900/40 px-1.5 py-0.5 text-xs text-blue-200"
                  >
                    {weekdayShort(day)}
                  </span>
                ))}
                {(data?.localities ?? []).map((locality) => (
                  <span
                    key={locality.id}
                    className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-gray-300"
                  >
                    {locality.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="xs" color="light" onClick={() => onEdit(route.id)}>
                <HiPencil className="mr-1 h-4 w-4" />
                Editar
              </Button>
              <Button
                size="xs"
                color="light"
                onClick={() => onAddClient(sheetLocalityId)}
              >
                <HiPlus className="mr-1 h-4 w-4" />
                Agregar cliente
              </Button>
              <Button
                size="xs"
                color="light"
                onClick={() =>
                  openRouteSheet({
                    routeName: route.name,
                    daysLabel:
                      (route.deliveryDays ?? []).map(weekdayShort).join(", ") ||
                      "Sin días",
                    dateLabel: `Generada el ${formatHumanDate(new Date(), "long")}`,
                    clients: clients.map((client) => ({
                      name: client.name,
                      businessName: client.businessName,
                      localityName: client.localityName,
                      phone: client.phone,
                      address: client.address,
                    })),
                  })
                }
              >
                <HiPrinter className="mr-1 h-4 w-4" />
                Hoja de ruta
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                <p className="text-xs text-gray-400">Ventas del mes</p>
                <p className="text-lg font-semibold text-blue-400">
                  {formatMXN(Number(row?.totalSales ?? 0))}
                </p>
              </div>
              <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                <p className="text-xs text-gray-400">Cantidad</p>
                <div className="text-lg font-semibold text-white">
                  {quantityLabel(Number(row?.totalQuantity ?? 0))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                <p className="text-xs text-gray-400">Utilidad del mes</p>
                <p
                  className={`text-lg font-semibold ${
                    Number(row?.profit ?? 0) < 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {formatMXN(Number(row?.profit ?? 0))}
                </p>
              </div>
              <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                <p className="text-xs text-gray-400">Margen</p>
                <p className="text-lg font-semibold text-white">
                  {row?.marginPct != null
                    ? `${Number(row.marginPct).toFixed(2)}%`
                    : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
                <p className="text-xs text-gray-400">Var. ventas</p>
                <p
                  className={`text-lg font-semibold ${
                    (row?.salesPct ?? 0) >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {variationLabel(row?.salesPct)}
                </p>
              </div>
            </div>

            <div
              className="overflow-hidden rounded-2xl border border-gray-700"
              data-testid="route-detail-clients"
            >
              {clients.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400">
                  Esta ruta aún no tiene clientes activos en sus localidades.
                </p>
              ) : (
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-gray-400 uppercase">
                    <tr>
                      <th className="px-3 py-2">Cliente</th>
                      <th className="px-3 py-2">Localidad</th>
                      <th className="px-3 py-2">Última compra</th>
                      <th className="px-3 py-2">Contacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-t border-gray-800">
                        <td className="px-3 py-2">
                          <span className="font-medium text-white">
                            {client.businessName ?? client.name}
                          </span>
                          {client.businessName && (
                            <span className="block text-xs text-gray-500">
                              {client.name}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {client.localityName ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          {client.lastPurchaseDate
                            ? formatHumanDate(client.lastPurchaseDate, "short")
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {client.phone ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {client.phone}
                              </span>
                              <a
                                href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="WhatsApp"
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <FaWhatsapp size={16} />
                              </a>
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                          {client.address && (
                            <span className="block text-xs text-gray-500">
                              {client.address}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </DrawerItems>
    </Drawer>
  );
};
