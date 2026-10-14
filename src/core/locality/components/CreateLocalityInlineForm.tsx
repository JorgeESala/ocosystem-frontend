import { useState } from "react";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
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
    const trimmed = name.trim();
    if (!trimmed) return;

    createMutation.mutate(
      { name: trimmed },
      {
        onSuccess: (locality) => {
          onCreated?.(locality);
          setName("");
        },
      },
    );
  };

  const errorMessage =
    (createMutation.error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ??
    (createMutation.error instanceof Error
      ? createMutation.error.message
      : null);

  return (
    <div className="mt-2 space-y-2 rounded-lg p-3">
      {errorMessage && (
        <Alert
          color="failure"
          onDismiss={() => createMutation.reset()}
          className="text-xs"
        >
          {errorMessage}
        </Alert>
      )}

      <Label>Nombre de la localidad</Label>

      <TextInput
        value={name}
        autoFocus
        placeholder="Ej. Cancun"
        onChange={(e) => setName(e.target.value)}
        disabled={createMutation.isPending}
      />

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          disabled={createMutation.isPending || !name.trim()}
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

        <Button
          size="sm"
          color="gray"
          type="button"
          onClick={onCancel}
          disabled={createMutation.isPending}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
