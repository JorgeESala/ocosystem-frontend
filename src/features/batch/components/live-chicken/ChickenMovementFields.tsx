import {
  useCreateRoute,
  useRoutes,
} from "@/features/live-chicken/api/routes.queries";
import { Button, Label, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { HiPlus, HiX, HiMap } from "react-icons/hi";

interface ChickenFieldsProps {
  register: any;
  watch: any;
  setValue: any;
}

export const ChickenMovementFields: React.FC<ChickenFieldsProps> = ({
  register,
  watch,
  setValue,
}) => {
  // --- ESTADOS PARA RUTA BUSCABLE Y CREACIÓN INLINE ---
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [routeSearchTerm, setRouteSearchTerm] = useState("");
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);

  // Carga de datos y mutación de rutas
  const { data: routes = [], isLoading: isLoadingRoutes } = useRoutes();
  const { mutate: createRoute, isPending: isCreatingRoute } = useCreateRoute();

  // Filtrado de rutas en tiempo real
  const filteredRoutes = routes.filter((r: any) =>
    r.name.toLowerCase().includes(routeSearchTerm.toLowerCase()),
  );

  // Obtener la ruta seleccionada actual para pintar en el buscador
  const selectedRouteId = watch("routeId");
  const selectedRoute = routes.find(
    (r: any) => r.id === Number(selectedRouteId),
  );

  // Manejo de guardado rápido de nueva ruta
  const handleQuickRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim()) return;

    createRoute(
      { name: newRouteName.trim() }, // Ajusta el payload según pida tu backend
      {
        onSuccess: (savedRoute: any) => {
          setIsAddingRoute(false);
          setNewRouteName("");
          // Auto-seleccionamos la ruta creada en el formulario global
          setValue("routeId", savedRoute.id);
        },
      },
    );
  };

  return (
    <>
      {/* 1. Cabezas (Aves) */}
      <div className="col-span-2 sm:col-span-1">
        <Label className="mb-2 block">Cabezas (Aves)</Label>
        <TextInput
          type="number"
          {...register("quantity", { required: true })}
        />
      </div>

      {/* 2. Peso Kg (Real / Venta) */}
      <div className="col-span-2 sm:col-span-1">
        <Label className="mb-2 block">Peso Kg (Real / Venta)</Label>
        <TextInput
          type="number"
          step="0.01"
          {...register("weight", { required: true })}
        />
      </div>

      {/* 3. KG Enviados (Báscula de salida de sucursal) */}
      <div className="col-span-2 sm:col-span-1">
        <Label className="mb-2 block">KG Enviados (Salida)</Label>
        <TextInput
          type="number"
          step="0.01"
          {...register("kgSent", { required: true })}
        />
      </div>

      {/* 4. Selector de Ruta Buscable / Creador Inline */}
      <div className="relative col-span-2 sm:col-span-1">
        <div className="mb-2 flex items-center justify-between">
          <Label>Ruta</Label>
          {!isAddingRoute && (
            <button
              type="button"
              onClick={() => {
                setIsAddingRoute(true);
                setIsRouteDropdownOpen(false);
              }}
              className="flex items-center gap-1 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              <HiPlus className="h-3 w-3" /> Nueva Ruta
            </button>
          )}
        </div>

        {!isAddingRoute ? (
          <div className="relative">
            <div className="relative flex items-center">
              <HiMap className="absolute left-3 z-10 h-5 w-5 text-gray-500" />
              <input
                type="text"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 py-2 pr-10 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder={
                  isLoadingRoutes
                    ? "Cargando rutas..."
                    : "Buscar o seleccionar ruta..."
                }
                value={
                  isRouteDropdownOpen
                    ? routeSearchTerm
                    : selectedRoute?.name || ""
                }
                onFocus={() => {
                  setIsRouteDropdownOpen(true);
                  setRouteSearchTerm("");
                }}
                onChange={(e) => {
                  setRouteSearchTerm(e.target.value);
                  setIsRouteDropdownOpen(true);
                }}
                disabled={isLoadingRoutes}
              />
              <div
                className="absolute right-3 flex cursor-pointer items-center text-gray-400"
                onClick={() => setIsRouteDropdownOpen(!isRouteDropdownOpen)}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Dropdown de Rutas */}
            {isRouteDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsRouteDropdownOpen(false)}
                />
                <ul className="absolute top-full left-0 z-30 mt-1 max-h-48 w-full divide-y divide-gray-800 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-1 shadow-xl">
                  {filteredRoutes.length > 0 ? (
                    filteredRoutes.map((r: any) => (
                      <li
                        key={r.id}
                        className={`cursor-pointer rounded px-3 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white ${Number(selectedRouteId) === r.id ? "bg-blue-600/20 font-semibold text-blue-400" : ""}`}
                        onClick={() => {
                          setValue("routeId", r.id);
                          setIsRouteDropdownOpen(false);
                        }}
                      >
                        {r.name}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-center text-xs text-gray-500 italic">
                      No se encontraron rutas
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        ) : (
          /* Mini-formulario inline para agregar ruta al vuelo */
          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/30 p-1.5">
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nombre de la ruta (Ej. Vía Corta)..."
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
              disabled={isCreatingRoute}
              required
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

        {/* Input oculto controlado para vincular el ID al React Hook Form */}
        <input type="hidden" {...register("routeId", { required: true })} />
      </div>
    </>
  );
};
