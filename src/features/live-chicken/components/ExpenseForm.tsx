import { useEffect, useState } from "react";
import { Button, Datepicker, Label, Spinner, TextInput } from "flowbite-react";
import type {
  ExpenseCreateRequestDTO,
  ExpenseResponseDTO,
  ExpenseUpdateRequestDTO,
} from "../types";
import { useCreateExpense, useUpdateExpense } from "../api/expense.queries";

interface ExpenseFormProps {
  initialData?: ExpenseResponseDTO;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ExpenseForm({
  initialData,
  onSaved,
  onCancel,
}: ExpenseFormProps) {
  const isEditing = Boolean(initialData);

  /* =======================
     Estado del formulario
  ======================= */
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  /* =======================
     Queries
  ======================= */
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const error = createMutation.error || updateMutation.error;

  /* =======================
     Precargar datos (edit)
  ======================= */
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setReason(initialData.reason);
      setDate(new Date(initialData.date));
    }
  }, [initialData]);

  /* =======================
     Submit
  ======================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !reason || !date) return;

    const formattedDate = date;

    if (isEditing && initialData) {
      const dto: ExpenseUpdateRequestDTO = {
        amount: Number(amount),
        reason,
        date: formattedDate,
      };

      updateMutation.mutate(
        { id: initialData.id, dto },
        { onSuccess: onSaved },
      );
    } else {
      const dto: ExpenseCreateRequestDTO = {
        amount: Number(amount),
        reason,
        date: formattedDate,
      };

      createMutation.mutate(dto, { onSuccess: onSaved });
    }
  };

  /* =======================
     Render
  ======================= */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Monto */}
      <div>
        <Label>Monto</Label>
        <TextInput
          type="number"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {/* Motivo */}
      <div>
        <Label>Motivo</Label>
        <TextInput
          type="text"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {/* Fecha */}
      <div>
        <Label>Fecha</Label>
        <Datepicker
          language="es-MX"
          value={date}
          onChange={(d) => d && setDate(d)}
        />
      </div>

      {error && (
        <div className="text-sm text-red-500">
          Ocurrió un error al guardar el gasto
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button color="gray" type="button" onClick={onCancel}>
          Cancelar
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              <Spinner size="sm" className="me-2" />
              Guardando...
            </div>
          ) : isEditing ? (
            "Actualizar"
          ) : (
            "Guardar"
          )}
        </Button>
      </div>
    </form>
  );
}
