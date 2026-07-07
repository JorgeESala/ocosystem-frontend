import { useState } from "react";
import { Button, Label, Select, Spinner } from "flowbite-react";
import { HiPlus, HiX } from "react-icons/hi";
import {
  useCreateRoute,
  useRoutes,
} from "@/core/api/route/routes.queries";
import { useDrivers } from "@/features/employee/api/employees.queries";
import { useVehicles } from "@/core/vehicle/api/vehicle.queries";

export default function FuelFields({ form, setForm }: any) {
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");

  const { data: drivers, isLoading: loadingDrivers } = useDrivers();
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const { data: routes, isLoading: loadingRoutes } = useRoutes();
  const { mutate: createRoute, isPending: isCreatingRoute } =
    useCreateRoute();

  const isLoading = loadingDrivers || loadingVehicles || loadingRoutes;

  const handleQuickRouteSubmit = () => {
    if (!newRouteName.trim()) return;
    createRoute(
      { name: newRouteName.trim() },
      {
        onSuccess: (savedRoute: any) => {
          setIsAddingRoute(false);
          setNewRouteName("");
          setForm((f: any) => ({
            ...f,
            fuel: { ...f.fuel, routeId: savedRoute.id },
          }));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Vehiculo</Label>
        <Select
          value={form.fuel.vehicleId}
          onChange={(e) =>
            setForm((f: any) => ({
              ...f,
              fuel: { ...f.fuel, vehicleId: e.target.value },
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
      </div>

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

      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label>Ruta</Label>
          {!isAddingRoute && (
            <button
              type="button"
              onClick={() => setIsAddingRoute(true)}
              className="flex items-center gap-1 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              <HiPlus className="h-3 w-3" /> Nueva Ruta
            </button>
          )}
        </div>

        {!isAddingRoute ? (
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
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/30 p-1.5">
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nombre de la ruta..."
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
              disabled={isCreatingRoute}
              autoFocus
            />
            <Button
              size="xs"
              color="blue"
              type="button"
              onClick={handleQuickRouteSubmit}
              disabled={isCreatingRoute || !newRouteName.trim()}
            >
              {isCreatingRoute ? "..." : "Guardar"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsAddingRoute(false);
                setNewRouteName("");
              }}
              className="p-1 text-gray-500 hover:text-gray-400"
            >
              <HiX className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}