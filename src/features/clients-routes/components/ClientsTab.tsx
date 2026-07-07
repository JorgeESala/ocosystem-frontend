import React, { useState } from "react";
import { Alert, Spinner } from "flowbite-react";
import { HiPencil, HiTrash } from "react-icons/hi";
import {
  useClients,
  useDeleteClient,
} from "@/core/client/api/client.queries";
import type { Client } from "@/core/api/types";
import { ClientFormModal } from "./ClientFormModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

export const ClientsTab: React.FC = () => {
  const { data: clients, isLoading, isError, error } = useClients();
  const deleteMutation = useDeleteClient();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);

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
        Error al cargar clientes:{" "}
        {error instanceof Error ? error.message : "desconocido"}
      </Alert>
    );
  }

  const rows = clients ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Nuevo cliente
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-700 bg-slate-950/70">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-700 p-10 text-center text-sm text-gray-400">
            No hay clientes registrados.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Negocio</th>
                <th className="px-4 py-3">Localidad</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-t border-gray-800 transition-colors hover:bg-slate-900/50"
                  onClick={() => openEdit(c.id)}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    <span className="inline-flex items-center gap-2">
                      {c.name}
                      <HiPencil
                        size={14}
                        className="text-gray-500 opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {c.businessName ? (
                      c.businessName
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {c.localityName ?? <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(c);
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

      <ClientFormModal
        show={showForm}
        clientIdToEdit={editingId}
        onClose={() => setShowForm(false)}
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
