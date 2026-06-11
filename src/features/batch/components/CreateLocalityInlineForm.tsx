import { useState } from "react";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { useCreateLocality } from "@/core/locality/api/locality.queries";
import type { Locality } from "@/core/locality/api/locality.api";

interface Props {
  onCancel: () => void;
  onCreated?: (locality: Locality) => void;
}

export default function CreateLocalityInlineForm({
  onCancel,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const createMutation = useCreateLocality();

  const handleSave = () => {
    if (!name.trim()) return;

    createMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: (locality) => {
          onCreated?.(locality);
          setName("");
        },
      },
    );
  };

  return (
    <div className="mt-2 space-y-2 rounded-lg p-3">
      <Label>Nombre de la localidad</Label>

      <TextInput
        value={name}
        autoFocus
        placeholder="Ej. Cancun"
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
