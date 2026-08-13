import { Label, Select, Spinner } from "flowbite-react";
import { VehicleExpenseCategory } from "../types/expense.types";
import { useDrivers } from "@/features/employee/api/employees.queries";
import { useVehicles } from "@/core/vehicle/api/vehicle.queries";
import { VehicleExpenseCategoryLabel } from "../api/vehicle-expense-category.labels";

export default function VehicleFields({ form, setForm }: any) {
  const { data: drivers, isLoading: loadingDrivers } = useDrivers();
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();

  const isLoading = loadingDrivers || loadingVehicles;
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t pt-3">
      <Label>Vehiculo</Label>
      <Select
        value={form.vehicle.vehicleId}
        onChange={(e) =>
          setForm((f: any) => ({
            ...f,
            vehicle: { ...f.vehicle, vehicleId: e.target.value },
          }))
        }
      >
        <option value="">Seleccione un vehiculo</option>
        {vehicles?.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </Select>

      <Label>Tipo de gasto</Label>
      <Select
        value={form.vehicle.category}
        onChange={(e) =>
          setForm((f: any) => ({
            ...f,
            vehicle: {
              ...f.vehicle,
              category: e.target.value as VehicleExpenseCategory,
            },
          }))
        }
      >
        {Object.values(VehicleExpenseCategory).map((value) => (
          <option key={value} value={value}>
            {VehicleExpenseCategoryLabel[value]}
          </option>
        ))}
      </Select>

      <Label>Chofer</Label>
      <Select
        value={form.vehicle.employeeId}
        onChange={(e) =>
          setForm((f: any) => ({
            ...f,
            vehicle: { ...f.vehicle, employeeId: e.target.value },
          }))
        }
      >
        <option value="">Seleccione un chofer</option>
        {drivers?.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
