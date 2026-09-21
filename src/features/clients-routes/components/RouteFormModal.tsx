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
  useCreateRoute,
  useRoute,
  useUpdateRoute,
} from "@/core/api/route/routes.queries";
import { useLocalities } from "@/core/locality/api/locality.queries";
import { emptyRouteForm, type RouteFormState } from "../types/forms";
import { WEEKDAYS } from "../config/unitConfig";

interface RouteFormModalProps {
  show: boolean;
  routeIdToEdit: number | null;
  onClose: () => void;
}

export const RouteFormModal: React.FC<RouteFormModalProps> = ({
  show,
  routeIdToEdit,
  onClose,
}) => {
  const isEdit = routeIdToEdit !== null;
  const { data: editingRoute, isLoading: loadingRoute } =
    useRoute(routeIdToEdit);
  const { data: localities, isLoading: loadingLocalities } = useLocalities();

  const [form, setForm] = useState<RouteFormState>(emptyRouteForm);
  const [error, setError] = useState<string | null>(null);
  const [localitySearch, setLocalitySearch] = useState("");
  const [localityOpen, setLocalityOpen] = useState(false);
  const localityRef = useRef<HTMLDivElement | null>(null);

  const createMutation = useCreateRoute();
  const updateMutation = useUpdateRoute();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!show) {
      setForm(emptyRouteForm);
      setError(null);
      setLocalitySearch("");
      setLocalityOpen(false);
      return;
    }
    if (isEdit && editingRoute) {
      setForm({
        name: editingRoute.name,
        localityIds: editingRoute.localityIds ?? [],
        deliveryDays: editingRoute.deliveryDays ?? [],
      });
    } else if (!isEdit) {
      setForm(emptyRouteForm);
      setLocalitySearch("");
    }
  }, [show, isEdit, editingRoute]);

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

  const toggleLocality = (id: number) => {
    setForm((prev) => ({
      ...prev,
      localityIds: prev.localityIds.includes(id)
        ? prev.localityIds.filter((localityId) => localityId !== id)
        : [...prev.localityIds, id],
    }));
    setLocalitySearch("");
  };

  const removeLocality = (id: number) => {
    setForm((prev) => ({
      ...prev,
      localityIds: prev.localityIds.filter((localityId) => localityId !== id),
    }));
  };

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      deliveryDays: prev.deliveryDays.includes(day)
        ? prev.deliveryDays.filter((value) => value !== day)
        : [...prev.deliveryDays, day],
    }));
  };

  const localityName = (id: number) =>
    localities?.find((locality) => locality.id === id)?.name ??
    `Localidad ${id}`;

  const handleSubmit = async () => {
    setError(null);
    const name = form.name.trim();
    if (!name) {
      setError("El nombre es obligatorio.");
      return;
    }
    const payload = {
      name,
      localityIds: [...form.localityIds].sort((a, b) => a - b),
      deliveryDays: [...form.deliveryDays].sort((a, b) => a - b),
    };
    try {
      if (isEdit && routeIdToEdit !== null) {
        await updateMutation.mutateAsync({ id: routeIdToEdit, payload });
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
      <ModalHeader>{isEdit ? "Editar ruta" : "Nueva ruta"}</ModalHeader>
      <ModalBody>
        {isEdit && loadingRoute ? (
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
            <div>
              <Label htmlFor="route-name">Nombre</Label>
              <TextInput
                id="route-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ej. Ruta Centro"
                required
                disabled={isSaving}
              />
            </div>

            <div ref={localityRef} className="relative">
              <Label htmlFor="route-locality">Localidades</Label>
              <div className="relative">
                <TextInput
                  id="route-locality"
                  value={localitySearch}
                  onChange={(e) => {
                    setLocalitySearch(e.target.value);
                    setLocalityOpen(true);
                  }}
                  onFocus={() => setLocalityOpen(true)}
                  placeholder={
                    loadingLocalities ? "Cargando..." : "Buscar localidad"
                  }
                  disabled={isSaving || loadingLocalities}
                  autoComplete="off"
                />
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
                  <HiChevronDown size={16} />
                </div>
              </div>
              {localityOpen && (
                <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-600 bg-gray-800 shadow-lg">
                  {filteredLocalities.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-gray-400">
                      Sin coincidencias
                    </li>
                  ) : (
                    filteredLocalities.map((locality) => {
                      const isSelected = form.localityIds.includes(locality.id);
                      return (
                        <li key={locality.id}>
                          <button
                            type="button"
                            onClick={() => toggleLocality(locality.id)}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                              isSelected
                                ? "bg-blue-600/20 text-blue-200"
                                : "text-gray-200 hover:bg-gray-700"
                            }`}
                          >
                            <span>{locality.name}</span>
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
              {form.localityIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.localityIds.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2 py-0.5 text-xs text-gray-200"
                    >
                      {localityName(id)}
                      <button
                        type="button"
                        onClick={() => removeLocality(id)}
                        aria-label={`Quitar ${localityName(id)}`}
                        className="text-gray-400 hover:text-white"
                      >
                        <HiX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Días de entrega</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {WEEKDAYS.map((weekday) => {
                  const isSelected = form.deliveryDays.includes(weekday.id);
                  return (
                    <button
                      key={weekday.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleDay(weekday.id)}
                      className={`h-8 w-11 rounded text-xs font-medium transition ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      }`}
                    >
                      {weekday.short}
                    </button>
                  );
                })}
              </div>
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
