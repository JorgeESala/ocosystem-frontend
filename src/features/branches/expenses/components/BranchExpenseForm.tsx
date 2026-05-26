import { useEffect, useState } from "react";
import {
  Button,
  Datepicker,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { useBranchBusinessCategories, useExpenseCategories } from "../api/branch-categories.queries";
import { useCreateBranchExpense, useUpdateBranchExpense } from "../api/branch-expenses.queries";
import type {
  BranchExpenseRequestDTO,
  BranchExpenseResponseDTO,
} from "../types";

interface BranchExpenseFormProps {
  initialData?: BranchExpenseResponseDTO;
  onSaved: (expense: BranchExpenseResponseDTO) => void;
  onCancel: () => void;
}

const toDate = (value?: string) => {
  if (!value) return new Date();
  return new Date(value.includes("T") ? value : `${value}T12:00:00`);
};

const resolveSelectValue = (
  currentId: number | undefined,
  currentName: string | undefined,
  items: Array<{ id: number; name: string }>,
) => {
  if (currentId) return String(currentId);
  if (!currentName) return "";
  const match = items.find((item) => item.name === currentName);
  return match ? String(match.id) : "";
};

export default function BranchExpenseForm({
  initialData,
  onSaved,
  onCancel,
}: BranchExpenseFormProps) {
  const isEditing = Boolean(initialData);
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const { data: expenseCategories = [], isLoading: loadingExpenseCategories } =
    useExpenseCategories();
  const {
    data: businessCategories = [],
    isLoading: loadingBusinessCategories,
  } = useBranchBusinessCategories();
  const { mutate: createExpense, isPending: creating } =
    useCreateBranchExpense();
  const { mutate: updateExpense, isPending: updating } =
    useUpdateBranchExpense();

  const [branchId, setBranchId] = useState("");
  const [expenseCategoryId, setExpenseCategoryId] = useState("");
  const [businessUnitCategoryId, setBusinessUnitCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    if (initialData) {
      setBranchId(String(initialData.branchId));
      setExpenseCategoryId(
        resolveSelectValue(
          initialData.expenseCategoryId,
          initialData.expenseCategoryName,
          expenseCategories,
        ),
      );
      setBusinessUnitCategoryId(
        resolveSelectValue(
          initialData.businessUnitCategoryId,
          initialData.businessUnitCategoryName ?? initialData.businessUnitName,
          businessCategories,
        ),
      );
      setAmount(String(initialData.amount ?? ""));
      setReason(initialData.reason ?? "");
      setDate(toDate(initialData.date));
      return;
    }

    setBranchId("");
    setExpenseCategoryId("");
    setBusinessUnitCategoryId("");
    setAmount("");
    setReason("");
    setDate(new Date());
  }, [initialData, expenseCategories, businessCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: BranchExpenseRequestDTO = {
      branchId: Number(branchId),
      expenseCategoryId: Number(expenseCategoryId),
      businessUnitCategoryId: Number(businessUnitCategoryId),
      amount: Number(amount),
      date,
      reason: reason.trim(),
    };

    if (isEditing && initialData) {
      updateExpense(
        { id: initialData.id, payload },
        {
          onSuccess: (saved) => {
            onSaved(saved);
          },
        },
      );
      return;
    }

    createExpense(payload, {
      onSuccess: (saved) => {
        onSaved(saved);
      },
    });
  };

  const isSubmitting = creating || updating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Sucursal</Label>
        <Select
          required
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          disabled={loadingBranches}
        >
          <option value="">
            {loadingBranches ? "Cargando sucursales..." : "Selecciona una sucursal"}
          </option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Tipo de gasto</Label>
        <Select
          required
          value={expenseCategoryId}
          onChange={(e) => setExpenseCategoryId(e.target.value)}
          disabled={loadingExpenseCategories}
        >
          <option value="">
            {loadingExpenseCategories
              ? "Cargando tipos..."
              : "Selecciona un tipo de gasto"}
          </option>
          {expenseCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Unidad de negocio</Label>
        <Select
          required
          value={businessUnitCategoryId}
          onChange={(e) => setBusinessUnitCategoryId(e.target.value)}
          disabled={loadingBusinessCategories}
        >
          <option value="">
            {loadingBusinessCategories
              ? "Cargando unidades..."
              : "Selecciona una unidad de negocio"}
          </option>
          {businessCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Monto</Label>
        <TextInput
          type="number"
          step="0.01"
          min="0"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div>
        <Label>Motivo</Label>
        <TextInput
          type="text"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div>
        <Label>Fecha</Label>
        <Datepicker
          language="es-MX"
          value={date}
          onChange={(d: Date | null) => setDate(d ?? new Date())}
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
