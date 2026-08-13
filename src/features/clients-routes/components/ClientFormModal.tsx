import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
  TextInput,
} from "flowbite-react";
import { HiCheck, HiChevronDown, HiX } from "react-icons/hi";
import {
  useClient,
  useCreateClient,
  useUpdateClient,
} from "@/core/client/api/client.queries";
import { useLocalities } from "@/core/locality/api/locality.queries";
import { emptyClientForm, type ClientFormState } from "../types/forms";

interface ClientFormModalProps {
  show: boolean;
  clientIdToEdit: number | null;
  onClose: () => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  show,
  clientIdToEdit,
  onClose,
}) => {
  const isEdit = clientIdToEdit !== null;
  const { data: editingClient, isLoading: loadingClient } =
    useClient(clientIdToEdit);
  const { data: localities, isLoading: loadingLocalities } = useLocalities();

  const [form, setForm] = useState<ClientFormState>(emptyClientForm);
  const [error, setError] = useState<string | null>(null);
  const [localitySearch, setLocalitySearch] = useState("");
  const [localityOpen, setLocalityOpen] = useState(false);
  const localityRef = useRef<HTMLDivElement | null>(null);

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!show) {
      setForm(emptyClientForm);
      setError(null);
      setLocalitySearch("");
      setLocalityOpen(false);
      return;
    }
    if (isEdit && editingClient) {
      setForm({
        name: editingClient.name,
        businessName: editingClient.businessName ?? "",
        localityId: editingClient.localityId ?? null,
      });
      const matchedLocality = localities?.find(
        (l) => l.id === editingClient.localityId,
      );
      setLocalitySearch(matchedLocality?.name ?? "");
    } else if (!isEdit) {
      setForm(emptyClientForm);
      setLocalitySearch("");
    }
  }, [show, isEdit, editingClient, localities]);

  useEffect(() => {
    if (!localityOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        localityRef.current &&
        !localityRef.current.contains(e.target as Node)
      ) {
        setLocalityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [localityOpen]);

  const filteredLocalities = useMemo(() => {
    const term = localitySearch.trim().toLowerCase();
    if (!term) return localities ?? [];
    return (localities ?? []).filter((l) =>
      l.name.toLowerCase().includes(term),
    );
  }, [localities, localitySearch]);

  const selectedLocality = useMemo(
    () => localities?.find((l) => l.id === form.localityId) ?? null,
    [localities, form.localityId],
  );

  const handleSelectLocality = (id: number, name: string) => {
    setForm((prev) => ({ ...prev, localityId: id }));
    setLocalitySearch(name);
    setLocalityOpen(false);
  };

  const handleClearLocality = () => {
    setForm((prev) => ({ ...prev, localityId: null }));
    setLocalitySearch("");
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim() && !form.businessName.trim()) {
      setError(
        "Ingresa al menos el nombre del cliente o el nombre del negocio.",
      );
      return;
    }
    const payload = {
      name: form.name.trim() || null,
      localityId: form.localityId,
      isInternalBranch: false,
      businessName: form.businessName.trim() || null,
    };
    try {
      if (isEdit && clientIdToEdit !== null) {
        await updateMutation.mutateAsync({ id: clientIdToEdit, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    }
  };

  return (
    <Modal show={show} size="md" popup onClose={onClose}>
      <ModalHeader>{isEdit ? "Editar cliente" : "Nuevo cliente"}</ModalHeader>
      <ModalBody>
        {isEdit && loadingClient ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert color="failure" onDismiss={() => setError(null)}>
                {error}
              </Alert>
            )}
            <p className="text-xs text-gray-400">
              Ingresa al menos uno: el nombre del cliente o el nombre del
              negocio.
            </p>
            <div>
              <Label htmlFor="client-name">Nombre del cliente</Label>
              <TextInput
                id="client-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ej. Juan Pérez"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="client-business-name">
                Nombre del negocio
                <span className="ml-1 text-xs font-normal text-gray-500">
                  (opcional)
                </span>
              </Label>
              <TextInput
                id="client-business-name"
                value={form.businessName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }))
                }
                placeholder="Ej. Abarrotes Don Pepe"
                disabled={isSaving}
              />
            </div>
            <div ref={localityRef} className="relative">
              <Label htmlFor="client-locality">Localidad</Label>
              <div className="relative">
                <TextInput
                  id="client-locality"
                  value={localitySearch}
                  onChange={(e) => {
                    setLocalitySearch(e.target.value);
                    setLocalityOpen(true);
                    if (form.localityId !== null) {
                      setForm((prev) => ({ ...prev, localityId: null }));
                    }
                  }}
                  onFocus={() => setLocalityOpen(true)}
                  placeholder={
                    loadingLocalities
                      ? "Cargando..."
                      : "Escribe para buscar una localidad"
                  }
                  disabled={isSaving || loadingLocalities}
                  autoComplete="off"
                />
                <div className="pointer-events-none absolute inset-y-0 right-8 flex items-center text-gray-500">
                  <HiChevronDown size={16} />
                </div>
                {form.localityId !== null && (
                  <button
                    type="button"
                    onClick={handleClearLocality}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-300"
                    title="Quitar localidad"
                  >
                    <HiX size={16} />
                  </button>
                )}
              </div>
              {localityOpen && (
                <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-600 bg-gray-800 shadow-lg">
                  {filteredLocalities.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-gray-400">
                      Sin coincidencias
                    </li>
                  ) : (
                    filteredLocalities.map((l) => {
                      const isSelected = l.id === form.localityId;
                      return (
                        <li key={l.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectLocality(l.id, l.name)}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                              isSelected
                                ? "bg-blue-600/20 text-blue-200"
                                : "text-gray-200 hover:bg-gray-700"
                            }`}
                          >
                            <span>{l.name}</span>
                            {isSelected && (
                              <HiCheck size={14} className="text-blue-400" />
                            )}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
              {selectedLocality && !localityOpen && (
                <p className="mt-1 text-xs text-gray-500">
                  Seleccionado:{" "}
                  <span className="text-gray-300">{selectedLocality.name}</span>
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button color="gray" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button color="blue" onClick={handleSubmit} disabled={isSaving}>
                {isEdit ? "Guardar cambios" : "Registrar"}
              </Button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};
