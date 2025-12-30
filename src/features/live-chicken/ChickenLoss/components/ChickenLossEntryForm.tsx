import { useState } from "react";
import { Button, Datepicker, Label, Spinner, TextInput } from "flowbite-react";

import {
  useCreateChickenLoss,
  useUpdateChickenLoss,
} from "@/features/live-chicken/ChickenLoss/api/chickenLoss.queries";
import type { ChickenLoss } from "@/features/live-chicken/ChickenLoss/types/chickenLoss.types";

interface ChickenLossEntryFormProps {
  batchId: number;
  initialData?: ChickenLoss;
  onSuccess: () => void;
}

export default function ChickenLossEntryForm({
  batchId,
  initialData,
  onSuccess,
}: ChickenLossEntryFormProps) {
  const isEditing = Boolean(initialData);

  const [quantity, setQuantity] = useState<number>(initialData?.quantity ?? 0);
  const [weight, setWeight] = useState<number>(initialData?.weight ?? 0);
  const [lossAmount, setLossAmount] = useState<number>(
    initialData?.lossAmount ?? 0,
  );
  const [date, setDate] = useState<Date>(initialData?.date ?? new Date());

  const createMutation = useCreateChickenLoss();
  const updateMutation = useUpdateChickenLoss();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (isEditing && initialData) {
      updateMutation.mutate(
        {
          id: initialData.id,
          data: {
            id: initialData.id,
            quantity,
            weight,
            lossAmount,
            batchId,
            date,
          },
        },
        { onSuccess },
      );
    } else {
      createMutation.mutate(
        {
          quantity,
          weight,
          lossAmount,
          batchId,
          date,
        },
        { onSuccess },
      );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Fecha de la baja</Label>
        <Datepicker
          language="es-MX"
          value={date}
          onChange={(d) => d && setDate(d)}
        />
      </div>

      <div>
        <Label>Cantidad de bajas</Label>
        <TextInput
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <div>
        <Label>Peso total de la baja (kg)</Label>
        <TextInput
          type="number"
          step="0.01"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
      </div>

      <div>
        <Label>Monto de la baja</Label>
        <TextInput
          type="number"
          step="0.01"
          value={lossAmount}
          onChange={(e) => setLossAmount(Number(e.target.value))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button color="red" disabled={isSubmitting}>
          Cancelar
        </Button>

        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              Guardando...
            </div>
          ) : isEditing ? (
            "Actualizar baja"
          ) : (
            "Registrar baja"
          )}
        </Button>
      </div>
    </div>
  );
}
