import React, { useEffect, useState } from "react";
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
import {
  useCreateRoute,
  useRoute,
  useUpdateRoute,
} from "@/core/api/route/routes.queries";
import { emptyRouteForm, type RouteFormState } from "../types/forms";

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
  const { data: editingRoute, isLoading: loadingRoute } = useRoute(
    routeIdToEdit,
  );

  const [form, setForm] = useState<RouteFormState>(emptyRouteForm);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateRoute();
  const updateMutation = useUpdateRoute();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!show) {
      setForm(emptyRouteForm);
      setError(null);
      return;
    }
    if (isEdit && editingRoute) {
      setForm({ name: editingRoute.name });
    } else if (!isEdit) {
      setForm(emptyRouteForm);
    }
  }, [show, isEdit, editingRoute]);

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    const payload = { name: form.name.trim() };
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
                  setForm({ name: e.target.value })
                }
                placeholder="Ej. Ruta Centro"
                required
                disabled={isSaving}
              />
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
