import { useEffect, useState } from "react";
import { Button, Label, Select } from "flowbite-react";
import { ExpenseCategoryCode } from "@/core/api/types";
import BaseExpenseFields from "./BaseExpenseFields";
import FoodFields from "./FoodFields";
import FuelFields from "./FuelFields";
import VehicleFields from "./VehicleFields";
import {
  VehicleExpenseCategory,
  type ExpenseDetailResponseDTO,
} from "../types/expense.types";
import { stringToDate } from "@/utils/date.utils";

type ExpenseFormState = {
  date: Date;
  amount: string;
  reason: string;
  food: {
    cedisId: string;
    weight: string;
  };
  fuel: {
    vehicleId: string;
    employeeId: string;
    routeId: string;
  };
  vehicle: {
    vehicleId: string;
    employeeId: string;
    category: VehicleExpenseCategory;
  };
};

interface ExpenseEntryFormProps {
  mode: "create" | "edit";
  initialData?: ExpenseDetailResponseDTO;
  onSubmit: (payload: { categoryCode: ExpenseCategoryCode; form: any }) => void;
  onCancel: () => void;
}

export default function ExpenseEntryForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: ExpenseEntryFormProps) {
  const [categoryCode, setCategoryCode] = useState<ExpenseCategoryCode>(
    ExpenseCategoryCode.FUEL,
  );
  const [form, setForm] = useState<ExpenseFormState>({
    date: new Date(),
    amount: "",
    reason: "",
    food: {
      cedisId: "",
      weight: "",
    },
    fuel: {
      vehicleId: "",
      employeeId: "",
      routeId: "",
    },
    vehicle: {
      vehicleId: "",
      employeeId: "",
      category: VehicleExpenseCategory.MAINTENANCE,
    },
  });

  useEffect(() => {
    if (!initialData) return;

    setCategoryCode(initialData.categoryCode);

    setForm({
      date: stringToDate(initialData.date),
      amount: initialData.amount.toString(),
      reason: initialData.reason ?? "",
      food: {
        cedisId: initialData.food?.cedisId.toString() ?? "",
        weight: initialData.food?.weight?.toString() ?? "",
      },
      fuel: {
        vehicleId: initialData.fuel?.vehicleId?.toString() ?? "",
        employeeId: initialData.fuel?.employeeId?.toString() ?? "",
        routeId: initialData.fuel?.routeId?.toString() ?? "",
      },
      vehicle: {
        vehicleId: initialData.vehicle?.vehicleId?.toString() ?? "",
        employeeId: initialData.vehicle?.employeeId?.toString() ?? "",
        category:
          initialData.vehicle?.category ?? VehicleExpenseCategory.MAINTENANCE,
      },
    });
  }, [initialData]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Categoria</Label>
        <Select
          value={categoryCode}
          onChange={(e) =>
            setCategoryCode(e.target.value as ExpenseCategoryCode)
          }
        >
          <option value="FUEL">Combustible</option>
          <option value="PAYROLL">Nómina</option>
          <option value="FOOD">Alimento</option>
          <option value="VEHICLE">Vehiculo</option>
          <option value="WATER">Agua</option>
          <option value="ELECTRICITY">Luz</option>
          <option value="INTERNET">Internet</option>
          <option value="RENT">Renta</option>
          <option value="OTHER">Otro</option>
        </Select>
      </div>

      <BaseExpenseFields form={form} setForm={setForm} />

      {categoryCode === "FOOD" && <FoodFields form={form} setForm={setForm} />}
      {categoryCode === "FUEL" && <FuelFields form={form} setForm={setForm} />}
      {categoryCode === "VEHICLE" && (
        <VehicleFields form={form} setForm={setForm} />
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button color="gray" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={() =>
            onSubmit({
              categoryCode,
              form,
            })
          }
        >
          {mode === "edit" ? "Guardar cambios" : "Registrar gasto"}
        </Button>
      </div>
    </div>
  );
}
