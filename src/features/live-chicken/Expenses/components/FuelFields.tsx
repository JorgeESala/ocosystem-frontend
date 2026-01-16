import { Label, Select, Spinner } from "flowbite-react";
import { useRoutes } from "@/features/live-chicken/api/routes.queries";
import { useDrivers } from "@/features/employee/api/employees.queries";
import { useVehicles } from "@/core/vehicle/api/vehicle.queries";

export default function FuelFields({ form, setForm }: any) {
  const { data: drivers, isLoading: loadingDrivers } = useDrivers();
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const { data: routes, isLoading: loadingRoutes } = useRoutes();

  const isLoading = loadingDrivers || loadingVehicles || loadingRoutes;

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t pt-3">
      {/* Vehículo */}
      <div>
        <Label>Vehículo</Label>
        <Select
          value={form.fuel.vehicleId}
          onChange={(e) =>
            setForm((f: any) => ({
              ...f,
              fuel: { ...f.fuel, vehicleId: e.target.value },
            }))
          }
        >
          <option value="">Seleccione un vehículo</option>
          {vehicles?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Chofer */}
      <div>
        <Label>Chofer</Label>
        <Select
          value={form.fuel.employeeId}
          onChange={(e) =>
            setForm((f: any) => ({
              ...f,
              fuel: { ...f.fuel, employeeId: e.target.value },
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

      {/* Ruta */}
      <div>
        <Label>Ruta</Label>
        <Select
          value={form.fuel.routeId}
          onChange={(e) =>
            setForm((f: any) => ({
              ...f,
              fuel: { ...f.fuel, routeId: e.target.value },
            }))
          }
        >
          <option value="">Seleccione una ruta</option>
          {routes?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
