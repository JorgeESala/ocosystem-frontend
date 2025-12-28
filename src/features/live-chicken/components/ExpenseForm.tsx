import React, { useEffect, useState } from "react";
import {
  Button,
  Datepicker,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";

import { Expense, ExpenseCategory } from "@/services/api";

interface ExpenseFormProps {
  initialData?: Expense;
  onSaved: (expense: Expense) => void;
  onCancel: () => void;
}

export default function ExpenseForm({
  initialData,
  onCancel,
}: ExpenseFormProps) {
  const isEditing = Boolean(initialData);

  // Campos
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [reason, setReason] = useState(initialData?.reason ?? "");
  const [date, setDate] = useState<Date>(
    initialData ? new Date(initialData.date) : new Date(),
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.category?.id?.toString() ?? "",
  );

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar cat y branch
  useEffect(() => {
    setCategories([
      { id: 1, name: "Combustible" },
      { id: 2, name: "Nomina" },
      { id: 3, name: "Otro" },
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // try {
    //   let saved: Expense;

    //   if (isEditing && initialData) {
    //     saved = await updateExpense(initialData.id, {
    //       amount: Number(amount),
    //       reason,
    //       date,
    //       categoryId: Number(categoryId),
    //       branchId: Number(branchId),
    //     });
    //   } else {
    //     saved = await createExpense({
    //       amount: Number(amount),
    //       reason,
    //       date,
    //       categoryId: Number(categoryId),
    //       branchId: Number(branchId),
    //     });
    //   }

    //   onSaved(saved);
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Categoría */}
      <div>
        <Label>Categoría</Label>
        <Select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

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
      {/* Empleado */}
      <div>
        <Label>Chofer</Label>
        <Select required onChange={(e) => setReason(e.target.value)}>
          <option value="">Seleccione un chofer</option>
          <option value="1">Jorge</option>
          <option value="2">Shamir</option>
          <option value="2">Erick</option>
          <option value="2">Jorge</option>
          <option value="2">Samuel</option>
        </Select>
      </div>
      {/* Ruta */}
      <div>
        <Label>Ruta</Label>
        <Select required onChange={(e) => setReason(e.target.value)}>
          <option value="">Seleccione una ruta</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="2">3</option>
          <option value="2">4</option>
          <option value="2">5</option>
          <option value="2">6</option>
        </Select>
      </div>

      {/* Fecha */}
      <div>
        <Label>Fecha</Label>
        <Datepicker
          language="es-MX"
          value={date}
          onChange={(d: Date | null) => setDate(d || new Date())}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button color="gray" type="button" onClick={onCancel}>
          Cancelar
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              <Spinner size="sm" className="me-2" light />
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
