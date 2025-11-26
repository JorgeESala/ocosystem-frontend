import React, { useEffect, useState } from "react";
import {
  Button,
  Datepicker,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";

import {
  Expense,
  ExpenseCategory,
  Branch,
  createExpense,
  updateExpense,
  fetchExpenseCategories,
  fetchBranches,
} from "../services/api";

interface ExpenseFormProps {
  initialData?: Expense;
  onSaved: (expense: Expense) => void;
  onCancel: () => void;
}

export default function ExpenseForm({
  initialData,
  onSaved,
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
  const [branchId, setBranchId] = useState<string>(
    initialData?.branch?.id?.toString() ?? "",
  );

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar cat y branch
  useEffect(() => {
    const loadData = async () => {
      const [catData, branchData] = await Promise.all([
        fetchExpenseCategories(),
        fetchBranches(),
      ]);
      setCategories(catData);
      setBranches(branchData);
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let saved: Expense;

      if (isEditing && initialData) {
        saved = await updateExpense(initialData.id, {
          amount: Number(amount),
          reason,
          date,
          categoryId: Number(categoryId),
          branchId: Number(branchId),
        });
      } else {
        saved = await createExpense({
          amount: Number(amount),
          reason,
          date,
          categoryId: Number(categoryId),
          branchId: Number(branchId),
        });
      }

      onSaved(saved);
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Sucursal */}
      <div>
        <Label>Sucursal</Label>
        <Select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          required
        >
          <option value="">Selecciona una sucursal</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
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
