import { useState } from "react";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { useCreateClient } from "@/features/processed/client/api/client.queries";
import type { Client } from "@/features/processed/client/types/client.types";

interface Props {
  onCancel: () => void;
  onCreated: (client: Client) => void;
}

export default function CreateClientInlineForm({ onCancel, onCreated }: Props) {
  const [name, setName] = useState("");

  const createMutation = useCreateClient();

  const handleSave = () => {
    if (!name.trim()) return;

    createMutation.mutate(
      { name },
      {
        onSuccess: (client) => {
          onCreated(client);
          setName("");
        },
      },
    );
  };

  return (
    <div className="mt-2 space-y-2 rounded-lg p-3">
      <Label>Nombre del cliente</Label>

      <TextInput
        value={name}
        autoFocus
        placeholder="Ej. Juan Pérez"
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
