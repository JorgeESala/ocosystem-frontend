import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Label,
  Spinner,
  TextInput,
} from "flowbite-react";
import { HiPencil, HiRefresh, HiTrash } from "react-icons/hi";
import {
  useDeleteRoute,
  useReactivateRoute,
  useRoutes,
} from "@/core/api/route/routes.queries";
import type { Route } from "@/core/api/types";
import { useLocalities } from "@/core/locality/api/locality.queries";
import { RouteFormModal } from "./RouteFormModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { RoutePerformanceModal } from "./RoutePerformanceModal";
import { RouteDetailDrawer } from "./RouteDetailDrawer";
import { ClientFormModal } from "./ClientFormModal";
import {
  InfoTooltip,
  RouteDeliveryDaysHelpContent,
  RouteLocalitiesHelpContent,
} from "./ClientsRoutesHelpContent";
import { weekdayShort, type ClientsRoutesUnitType } from "../config/unitConfig";
import { includesNormalized } from "../utils/text";

interface RoutesTabProps {
  unitType: ClientsRoutesUnitType;
  initialPerformancePeriod?: { from: Date; to: Date } | null;
  initialDetailRouteId?: number | null;
}

export const RoutesTab: React.FC<RoutesTabProps> = ({
  unitType,
  initialPerformancePeriod,
  initialDetailRouteId,
}) => {
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Route | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [detailRouteId, setDetailRouteId] = useState<number | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientFormLocalityId, setClientFormLocalityId] = useState<
    number | null
  >(null);
  const [performanceRange, setPerformanceRange] = useState<{
    from: Date;
    to: Date;
  } | null>(null);

  useEffect(() => {
    if (initialPerformancePeriod) {
      setPerformanceRange(initialPerformancePeriod);
      setShowPerformance(true);
    }
  }, [initialPerformancePeriod]);

  useEffect(() => {
    if (initialDetailRouteId != null) {
      setDetailRouteId(initialDetailRouteId);
    }
  }, [initialDetailRouteId]);

  const {
    data: routes,
    isLoading,
    isError,
    error,
  } = useRoutes(includeInactive);
  const { data: localities } = useLocalities();
  const deleteMutation = useDeleteRoute();
  const reactivateMutation = useReactivateRoute();

  const rows = useMemo(() => {
    const term = search.trim();
    const all = routes ?? [];
    if (!term) return all;
    return all.filter((route) => includesNormalized(route.name, term));
  }, [routes, search]);

  const localityName = (id: number) =>
    localities?.find((locality) => locality.id === id)?.name ?? `#${id}`;

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
        Error al cargar rutas:{" "}
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
          placeholder="Buscar ruta"
          className="w-full sm:w-64"
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
          <Checkbox
            id="routes-inactive"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          <Label htmlFor="routes-inactive">Mostrar inactivas</Label>
        </label>
        <div className="ml-auto flex gap-2">
          <Button color="light" onClick={() => setShowPerformance(true)}>
            Rendimiento
          </Button>
          <Button color="blue" onClick={openCreate}>
            Nueva ruta
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-700 bg-slate-950/70">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-700 p-10 text-center text-sm text-gray-400">
            No hay rutas registradas.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    Localidades
                    <InfoTooltip
                      label="¿Cómo se asignan las localidades?"
                      content={<RouteLocalitiesHelpContent />}
                    />
                  </span>
                </th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    Días
                    <InfoTooltip
                      label="¿Qué significan los días de entrega?"
                      content={<RouteDeliveryDaysHelpContent />}
                    />
                  </span>
                </th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((route) => (
                <tr
                  key={route.id}
                  className="group cursor-pointer border-t border-gray-800 transition-colors hover:bg-slate-900/50"
                  onClick={() => setDetailRouteId(route.id)}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    <span className="inline-flex items-center gap-2">
                      {route.name}
                      {route.active === false && (
                        <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300">
                          Inactiva
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {route.localityIds && route.localityIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {route.localityIds.map((id) => (
                          <span
                            key={id}
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-gray-300"
                          >
                            {localityName(id)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {route.deliveryDays && route.deliveryDays.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {route.deliveryDays.map((day) => (
                          <span
                            key={day}
                            className="rounded bg-blue-900/40 px-1.5 py-0.5 text-xs text-blue-200"
                          >
                            {weekdayShort(day)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(route.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-700 hover:text-white focus:opacity-100"
                        title="Editar"
                      >
                        <HiPencil size={14} />
                      </button>
                      {route.active === false ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReactivate(route.id);
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
                            setPendingDelete(route);
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RouteFormModal
        show={showForm}
        routeIdToEdit={editingId}
        onClose={() => setShowForm(false)}
      />

      <RoutePerformanceModal
        show={showPerformance}
        onClose={() => setShowPerformance(false)}
        unitType={unitType}
        routes={routes ?? []}
        initialRange={performanceRange}
      />

      <RouteDetailDrawer
        routeId={detailRouteId}
        unitType={unitType}
        onClose={() => setDetailRouteId(null)}
        onEdit={(routeId) => {
          setDetailRouteId(null);
          openEdit(routeId);
        }}
        onAddClient={(localityId) => {
          setDetailRouteId(null);
          setClientFormLocalityId(localityId);
          setShowClientForm(true);
        }}
      />

      <ClientFormModal
        show={showClientForm}
        clientIdToEdit={null}
        initialLocalityId={clientFormLocalityId}
        onClose={() => setShowClientForm(false)}
      />

      <ConfirmDeleteModal
        show={pendingDelete !== null}
        title={`¿Eliminar "${pendingDelete?.name ?? ""}"?`}
        message="La ruta se marcará como inactiva. No se eliminará de la base de datos."
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
