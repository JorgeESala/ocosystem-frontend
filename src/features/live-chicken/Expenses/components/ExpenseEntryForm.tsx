import { useEffect, useState } from "react";
import { Button, Label, Select, TextInput } from "flowbite-react";
import BaseExpenseFields from "./BaseExpenseFields";

type ExpenseCategory = "GENERIC" | "FUEL" | "FOOD" | "VEHICLE";

interface ExpenseEntryFormProps {
  mode: "create" | "edit";
  initialData?: any; // demo
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExpenseEntryForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: ExpenseEntryFormProps) {
  const [category, setCategory] = useState<ExpenseCategory>("FUEL");

  useEffect(() => {
    if (initialData?.category) {
      setCategory(initialData.category);
    }
  }, [initialData]);

  return (
    <div className="space-y-4">
      {/* Selector solo en CREATE */}
      {mode === "create" && (
        <div>
          <Label>Categoría</Label>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            <option value="FUEL">Combustible</option>
            <option value="FOOD">Alimento</option>
            <option value="VEHICLE">Vehículo</option>
            <option value="GENERIC">Agua</option>
            <option value="LIGHT">Luz</option>
            <option value="INTERNET">Internet</option>
            <option value="RENT">Renta</option>
            <option value="CREDIT">Créditos</option>
            <option value="CLEANING">Limpieza</option>
            <option value="OTHER">Otro</option>
          </Select>
        </div>
      )}

      <BaseExpenseFields />

      {category === "FUEL" && <FuelFields />}
      {category === "FOOD" && <FoodFields />}
      {category === "VEHICLE" && <VehicleFields />}

      <div className="flex justify-end gap-2 pt-4">
        <Button color="gray" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSuccess}>
          {mode === "edit" ? "Guardar cambios" : "Registrar gasto"}
        </Button>
      </div>
    </div>
  );
}
function FuelFields() {
  return (
    <div className="space-y-3 border-t pt-3">
      <Label>Vehículo</Label>
      <Select>
        <option>Seleccione un vehiculo</option>
        <option>Foton Miller</option>
        <option>Np 300</option>
        <option>Foton 150</option>
        <option>Robust</option>
      </Select>

      <Label>Chofer</Label>
      <Select>
        <option value="">Samuel</option>
        <option value="">Erick</option>
        <option value="">Jorge</option>
        <option value="">Shamir</option>
        <option value="">Marco</option>
      </Select>
      <Label>Ruta</Label>
      <Select>
        <option value="">Express FCP</option>
        <option value="">Via corta</option>
        <option value="">Foraneo</option>
        <option value="">Chunhuas</option>
      </Select>
    </div>
  );
}
function FoodFields() {
  return (
    <div className="space-y-3 border-t pt-3">
      <Label>Kilos</Label>
      <TextInput type="number" />
    </div>
  );
}
function VehicleFields() {
  return (
    <div className="space-y-3 border-t pt-3">
      <Label>Vehículo</Label>
      <Select>
        <option>Seleccione un vehiculo</option>
        <option>Foton Miller</option>
        <option>Np 300</option>
        <option>Foton 150</option>
        <option>Robust</option>
      </Select>

      <Label>Tipo de gasto</Label>
      <Select>
        <option>Mantenimiento</option>
        <option>Reparación</option>
      </Select>
      <Label>Chofer</Label>
      <Select>
        <option value="">Samuel</option>
        <option value="">Erick</option>
        <option value="">Jorge</option>
        <option value="">Shamir</option>
        <option value="">Marco</option>
      </Select>
    </div>
  );
}
