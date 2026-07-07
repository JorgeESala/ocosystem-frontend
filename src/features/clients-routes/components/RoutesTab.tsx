import React, { useState } from "react";
import { Alert, Spinner } from "flowbite-react";
import { HiPencil, HiTrash } from "react-icons/hi";
import {
  useDeleteRoute,
  useRoutes,
} from "@/core/api/route/routes.queries";
import type { Route } from "@/core/api/types";
import { RouteFormModal } from "./RouteFormModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

export const RoutesTab: React.FC = () => {
  const { data: routes, isLoading, isError, error } = useRoutes();
  const deleteMutation = useDeleteRoute();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Route | null>(null);

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

  const rows = routes ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Nueva ruta
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-700 bg-slate-950/70">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-700 p-10 text-center text-sm text-gray-400">
            No hay rutas registradas.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-t border-gray-800 transition-colors hover:bg-slate-900/50"
                  onClick={() => openEdit(r.id)}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    <span className="inline-flex items-center gap-2">
                      {r.name}
                      <HiPencil
                        size={14}
                        className="text-gray-500 opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(r);
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-red-900/30 px-2 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-800 hover:text-white"
                      title="Eliminar"
                    >
                      <HiTrash size={14} />
                    </button>
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
