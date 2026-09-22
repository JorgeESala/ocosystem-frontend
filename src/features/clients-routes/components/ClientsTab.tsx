import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Checkbox,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import {
  HiChevronDown,
  HiChevronUp,
  HiClock,
  HiDocumentDownload,
  HiPencil,
  HiRefresh,
  HiTrash,
} from "react-icons/hi";
import {
  useClients,
  useDeleteClient,
  useReactivateClient,
} from "@/core/client/api/client.queries";
import { useRoutes } from "@/core/api/route/routes.queries";
import type { Client, Route } from "@/core/api/types";
import { formatHumanDate } from "@/utils/date.utils";
import { ClientFormModal } from "./ClientFormModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { ClientHistoryModal } from "./ClientHistoryModal";
import { ClientDetailDrawer } from "./ClientDetailDrawer";
import {
  ClientRouteHelpContent,
  InfoTooltip,
} from "./ClientsRoutesHelpContent";
import { type ClientsRoutesUnitType } from "../config/unitConfig";
import { includesNormalized } from "../utils/text";
import { exportClientsToExcel } from "../utils/exportClients";

interface ClientsTabProps {
  unitType: ClientsRoutesUnitType;
  initialRouteFilter?: RouteFilter;
  initialDormantDays?: number | null;
  initialClientType?: ClientTypeFilter;
}

type RouteFilter = "all" | "none" | number;

type ClientTypeFilter = "all" | "branch" | "internal" | "external";

type SortField = "name" | "lastPurchase";

const DORMANT_OPTIONS = [15, 30, 60, 90];

export const ClientsTab: React.FC<ClientsTabProps> = ({
  unitType,
  initialRouteFilter,
  initialDormantDays,
  initialClientType,
}) => {
  const { slug } = useParams();
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>("all");
  const [dormantFilter, setDormantFilter] = useState("all");
  const [clientTypeFilter, setClientTypeFilter] =
    useState<ClientTypeFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  const {
    data: clients,
    isLoading,
    isError,
    error,
  } = useClients(includeInactive);
  const { data: routes } = useRoutes();
  const deleteMutation = useDeleteClient();
  const reactivateMutation = useReactivateClient();

  useEffect(() => {
    if (initialRouteFilter !== undefined) {
      setRouteFilter(initialRouteFilter);
    }
  }, [initialRouteFilter]);

  useEffect(() => {
    setDormantFilter(
      initialDormantDays != null ? String(initialDormantDays) : "all",
    );
  }, [initialDormantDays]);

  useEffect(() => {
    if (initialClientType !== undefined) {
      setClientTypeFilter(initialClientType);
    }
  }, [initialClientType]);

  const routesByLocality = useMemo(() => {
    const map = new Map<number, Route[]>();
    (routes ?? []).forEach((route) => {
      (route.localityIds ?? []).forEach((localityId) => {
        const list = map.get(localityId) ?? [];
        list.push(route);
        map.set(localityId, list);
      });
    });
    return map;
  }, [routes]);

  const clientRoutes = useCallback(
    (client: Client): Route[] =>
      client.localityId != null
        ? (routesByLocality.get(client.localityId) ?? [])
        : [],
    [routesByLocality],
  );

  const matchesClientType = useCallback(
    (client: Client): boolean => {
      if (clientTypeFilter === "all") return true;
      if (clientTypeFilter === "branch") return client.isInternalBranch;
      if (clientTypeFilter === "internal") {
        return !client.isInternalBranch && client.isInternalClient === true;
      }
      return !client.isInternalBranch && !client.isInternalClient;
    },
    [clientTypeFilter],
  );

  const rows = useMemo(() => {
    const term = search.trim();
    const filtered = (clients ?? []).filter((client) => {
      const matchesSearch =
        !term ||
        includesNormalized(client.name, term) ||
        includesNormalized(client.businessName ?? "", term) ||
        includesNormalized(client.localityName ?? "", term);
      if (!matchesSearch) return false;

      if (!matchesClientType(client)) return false;

      if (dormantFilter !== "all") {
        if (!client.lastPurchaseDate) return false;
        const lastPurchase = new Date(`${client.lastPurchaseDate}T00:00:00`);
        const daysSince = Math.floor(
          (Date.now() - lastPurchase.getTime()) / 86400000,
        );
        if (daysSince < Number(dormantFilter)) return false;
      }

      if (routeFilter === "all") return true;
      const clientRouteList = clientRoutes(client);
      if (routeFilter === "none") return clientRouteList.length === 0;
      return clientRouteList.some((route) => route.id === routeFilter);
    });

    return [...filtered].sort((left, right) => {
      if (sortField === "lastPurchase") {
        const leftDate = left.lastPurchaseDate ?? "";
        const rightDate = right.lastPurchaseDate ?? "";
        return sortDir === "asc"
          ? leftDate.localeCompare(rightDate)
          : rightDate.localeCompare(leftDate);
      }
      const comparison = left.name.localeCompare(right.name, "es", {
        sensitivity: "base",
      });
      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [
    clients,
    search,
    routeFilter,
    dormantFilter,
    clientRoutes,
    matchesClientType,
    sortField,
    sortDir,
  ]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDir("asc");
  };

  const sortIcon = (field: SortField) =>
    sortField === field ? (
      sortDir === "asc" ? (
        <HiChevronUp className="inline h-3 w-3" />
      ) : (
        <HiChevronDown className="inline h-3 w-3" />
      )
    ) : null;

  const openCreate = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (id: number) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deleteMutation.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  };

  const handleReactivate = async (id: number) => {
    await reactivateMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert color="failure">
        Error al cargar clientes:{" "}
        {error instanceof Error ? error.message : "desconocido"}
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente"
          className="w-full sm:w-64"
        />
        <div>
          <Label htmlFor="clients-route-filter" className="sr-only">
            Filtrar por ruta
          </Label>
          <Select
            id="clients-route-filter"
            value={String(routeFilter)}
            onChange={(e) =>
              setRouteFilter(
                e.target.value === "all" || e.target.value === "none"
                  ? e.target.value
                  : Number(e.target.value),
              )
            }
          >
            <option value="all">Todas las rutas</option>
            {(routes ?? []).map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
            <option value="none">Sin ruta</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="clients-dormant-filter" className="sr-only">
            Última compra
          </Label>
          <Select
            id="clients-dormant-filter"
            value={dormantFilter}
            onChange={(e) => setDormantFilter(e.target.value)}
          >
            <option value="all">Última compra: todas</option>
            {DORMANT_OPTIONS.map((days) => (
              <option key={days} value={days}>
                Sin compras +{days} días
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="clients-type-filter" className="sr-only">
            Tipo de cliente
          </Label>
          <Select
            id="clients-type-filter"
            value={clientTypeFilter}
            onChange={(e) =>
              setClientTypeFilter(e.target.value as ClientTypeFilter)
            }
          >
            <option value="all">Todos los tipos</option>
            <option value="branch">Sucursales</option>
            <option value="internal">Clientes internos</option>
            <option value="external">Externos</option>
          </Select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
          <Checkbox
            id="clients-inactive"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          <Label htmlFor="clients-inactive">Mostrar inactivos</Label>
        </label>
        <div className="ml-auto flex gap-2">
          <Button
            color="light"
            onClick={() =>
              exportClientsToExcel(rows, clientRoutes, "clientes.xlsx")
            }
            disabled={rows.length === 0}
          >
            <HiDocumentDownload className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button color="blue" onClick={openCreate}>
            Nuevo cliente
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-700 bg-slate-950/70">
        {rows.length === 0 ? (
          (clients ?? []).length === 0 ? (
            <div
              className="space-y-3 p-8 text-center"
              data-testid="clients-onboarding"
            >
              <h3 className="text-sm font-semibold text-white">
                Primeros pasos
              </h3>
              <ol className="mx-auto max-w-md list-decimal space-y-1 text-left text-sm text-gray-400">
                <li>Crea tus rutas y asígnales localidades en el tab Rutas.</li>
                <li>Registra clientes con su localidad.</li>
                <li>
                  Los clientes aparecerán solos en su ruta según la localidad.
                </li>
              </ol>
              <Link
                to={`/business/${slug}/clients-routes/help`}
                className="inline-block text-sm text-blue-400 hover:text-blue-300"
              >
                Ver la guía completa
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-700 p-10 text-center text-sm text-gray-400">
              No hay clientes que coincidan con los filtros.
            </div>
          )
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="inline-flex items-center gap-1 uppercase"
                  >
                    Nombre
                    {sortIcon("name")}
                  </button>
                </th>
                <th className="px-4 py-3">Negocio</th>
                <th className="px-4 py-3">Localidad</th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    Ruta
                    <InfoTooltip
                      label="¿Cómo se asigna la ruta?"
                      content={<ClientRouteHelpContent />}
                    />
                  </span>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("lastPurchase")}
                    className="inline-flex items-center gap-1 uppercase"
                  >
                    Última compra
                    {sortIcon("lastPurchase")}
                  </button>
                </th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((client) => {
                const clientRouteList = clientRoutes(client);
                return (
                  <tr
                    key={client.id}
                    className="group cursor-pointer border-t border-gray-800 transition-colors hover:bg-slate-900/50"
                    onClick={() => setDetailClient(client)}
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      <span className="inline-flex items-center gap-2">
                        {client.name}
                        {client.active === false && (
                          <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300">
                            Inactivo
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {client.businessName ? (
                        client.businessName
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {client.localityName ?? (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {clientRouteList.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {clientRouteList.map((route) => (
                            <span
                              key={route.id}
                              className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-gray-300"
                            >
                              {route.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {client.lastPurchaseDate ? (
                        formatHumanDate(client.lastPurchaseDate, "short")
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {client.isInternalBranch ? (
                        <span className="rounded bg-blue-800 px-1.5 py-0.5 text-[10px] font-semibold text-blue-200">
                          Sucursal
                        </span>
                      ) : client.isInternalClient ? (
                        <span className="rounded bg-emerald-800 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
                          Cliente interno
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Externo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(client.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-700 hover:text-white focus:opacity-100"
                          title="Editar"
                        >
                          <HiPencil size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setHistoryClient(client);
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-slate-700 hover:text-white"
                          title="Historial"
                        >
                          <HiClock size={14} />
                        </button>
                        {client.active === false ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReactivate(client.id);
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-800 hover:text-white"
                            title="Reactivar"
                          >
                            <HiRefresh size={14} />
                            Reactivar
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDelete(client);
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-red-900/30 px-2 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-800 hover:text-white"
                            title="Eliminar"
                          >
                            <HiTrash size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ClientFormModal
        show={showForm}
        clientIdToEdit={editingId}
        onClose={() => setShowForm(false)}
      />

      <ClientDetailDrawer
        client={detailClient}
        routes={detailClient ? clientRoutes(detailClient) : []}
        unitType={unitType}
        onClose={() => setDetailClient(null)}
        onEdit={(clientId) => {
          setDetailClient(null);
          openEdit(clientId);
        }}
        onHistory={(client) => {
          setDetailClient(null);
          setHistoryClient(client);
        }}
      />

      <ClientHistoryModal
        show={historyClient !== null}
        onClose={() => setHistoryClient(null)}
        unitType={unitType}
        client={historyClient}
      />

      <ConfirmDeleteModal
        show={pendingDelete !== null}
        title={`¿Eliminar "${pendingDelete?.name ?? ""}"?`}
        message="El cliente se marcará como inactivo. No se eliminará de la base de datos."
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
