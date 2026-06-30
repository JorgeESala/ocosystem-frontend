import { useState } from "react";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { useCreateRoute } from "@/core/api/route/routes.queries";
import type { Route } from "../types";

interface Props {
  onCreated: (route: Route) => void;
  onCancel: () => void;
}
export default function CreateRouteInlineForm({ onCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const createMutation = useCreateRoute();

  const handleSave = () => {
    if (!name.trim()) return;

    createMutation.mutate(
      { name },
      {
        onSuccess: (route) => {
          onCreated(route);
          setName("");
        },
      },
    );
  };

  return (
    <div className="mt-2 space-y-2 rounded-lg p-3">
      <Label>Nombre de la ruta</Label>

      <TextInput
        value={name}
        autoFocus
        placeholder="Ej. Ruta Norte"
        onChange={(e) => setName(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          disabled={createMutation.isPending}
          onClick={handleSave}
        >
          {createMutation.isPending ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              Guardando...
            </div>
          ) : (
            "Guardar"
          )}
        </Button>

        <Button size="sm" color="gray" type="button" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
