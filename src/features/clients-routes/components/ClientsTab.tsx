import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { HiClock, HiRefresh, HiTrash } from "react-icons/hi";
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
import {
  ClientRouteHelpContent,
  InfoTooltip,
} from "./ClientsRoutesHelpContent";
import { type ClientsRoutesUnitType } from "../config/unitConfig";

interface ClientsTabProps {
  unitType: ClientsRoutesUnitType;
  initialRouteFilter?: RouteFilter;
  initialDormantDays?: number | null;
}

type RouteFilter = "all" | "none" | number;

const DORMANT_OPTIONS = [15, 30, 60, 90];

export const ClientsTab: React.FC<ClientsTabProps> = ({
  unitType,
  initialRouteFilter,
  initialDormantDays,
}) => {
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>("all");
  const [dormantFilter, setDormantFilter] = useState("all");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);

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

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (clients ?? []).filter((client) => {
      const matchesSearch =
        !term ||
        client.name.toLowerCase().includes(term) ||
        (client.businessName ?? "").toLowerCase().includes(term) ||
        (client.localityName ?? "").toLowerCase().includes(term);
      if (!matchesSearch) return false;

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
  }, [clients, search, routeFilter, dormantFilter, clientRoutes]);

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
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
          <Checkbox
            id="clients-inactive"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          <Label htmlFor="clients-inactive">Mostrar inactivos</Label>
        </label>
        <div className="ml-auto">
          <Button color="blue" onClick={openCreate}>
            Nuevo cliente
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-700 bg-slate-950/70">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-700 p-10 text-center text-sm text-gray-400">
            No hay clientes registrados.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3">Nombre</th>
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
                <th className="px-4 py-3">Última compra</th>
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
                    className="cursor-pointer border-t border-gray-800 transition-colors hover:bg-slate-900/50"
                    onClick={() => openEdit(client.id)}
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
