import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  TextInput,
  Select,
  Button,
  Radio,
  Datepicker,
} from "flowbite-react";
import {
  HiCurrencyDollar,
  HiUser,
  HiIdentification,
  HiPlus,
} from "react-icons/hi";
import { UNIT_CONFIG } from "../config/unitConfig";
import { useCreateBatchSale, useUpdateBatchSale } from "../api/batch.queries";
import {
  useCreateAdjustment,
  useUpdateBatchAdjustment,
} from "../api/batch.adjustments.queries";
import { useEmployees } from "@/features/employee/api/employees.queries";
import { useClients, useCreateClient } from "@/core/client/api/client.queries";
import type { Batch } from "../types.batch";
import { toLocalDateString } from "@/utils/date.utils";
import { calculateEggUnits } from "@/utils/egg.utils";

export const BatchMovementModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  initialData?: any;
}> = ({ batch, onClose, initialData }) => {
  const isEditing = !!initialData;
  const config = UNIT_CONFIG[batch.type];
  const MovementFields = config.movementFormFields;

  // --- ESTADOS PARA CREACIÓN RÁPIDA DE CLIENTE ---
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const { mutate: createClient, isPending: isCreatingClient } =
    useCreateClient();
  const getInitialValues = () => {
    if (!isEditing) {
      return {
        movementType: "SALE",
        saleDate: toLocalDateString(new Date()),
        pricePerKg: batch.metadata?.pricePerKg || 0,
      };
    }

    const baseValues = {
      ...initialData,
      movementType: initialData.type,
      saleDate: initialData.date,
    };

    // SI ES HUEVO: Desglosamos la cantidad total en las unidades visibles
    if (batch.type === "EGG") {
      const { boxes, cartons, pieces } = calculateEggUnits(
        initialData.quantity || 0,
      );
      return {
        ...baseValues,
        boxes,
        cartons,
        quantity: pieces, // 'quantity' en el form de huevo representa las piezas sueltas
      };
    }

    return baseValues;
  };

  const { register, handleSubmit, watch, control, setValue, reset } =
    useForm<any>({
      defaultValues: getInitialValues(),
    });

  const watchMovementType = watch("movementType");
  const watchWeight = watch("weight");
  const watchPrice = watch("pricePerKg");

  // Lógica de cálculo automático (Opcional, pero muy Senior)
  useEffect(() => {
    if (watchWeight && watchPrice && watchMovementType === "SALE") {
      const total = Number(watchWeight) * Number(watchPrice);
      setValue("saleTotal", total.toFixed(2));
    }
  }, [watchWeight, watchPrice, watchMovementType, setValue]);

  const { mutate: recordSale } = useCreateBatchSale();
  const { mutate: updateSale } = useUpdateBatchSale();
  const { mutate: recordAdjustment } = useCreateAdjustment();
  const { mutate: updateAdjustment } = useUpdateBatchAdjustment();
  const { data: employees = [], isLoading: isLoadingEmployees } =
    useEmployees();
  const { data: clients = [] } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filtrar clientes en tiempo real según lo que escriba el usuario
  const filteredClients = clients.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Obtener el nombre del cliente seleccionado actualmente para mostrarlo en el input
  const selectedClientId = watch("clientId");
  const selectedClient = clients.find(
    (c: any) => c.id === Number(selectedClientId),
  );
  useEffect(() => {
    if (isEditing && !isLoadingEmployees && employees.length > 0) {
      // Volvemos a setear los valores iniciales.
      // reset() comparará y llenará los campos, incluyendo el select de empleados ahora que existen las opciones.
      reset(getInitialValues());
    }
  }, [employees, isLoadingEmployees, isEditing, reset]);
  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      batchId: batch.id,
      // Aseguramos que los números viajen como tales
      saleTotal: Number(data.saleTotal || 0),
      weight: Number(data.weight || 0),
      quantity: Number(data.quantity || 0),
    };

    if (data.movementType === "SALE") {
      if (isEditing) {
        // Mandamos el ID y el payload al PUT
        updateSale(
          { id: initialData.id, data: payload },
          { onSuccess: onClose },
        );
      } else {
        recordSale(payload, { onSuccess: onClose });
      }
    } else {
      const adjustmentPayload = { ...payload, adjustmentDate: data.saleDate };

      if (isEditing) {
        updateAdjustment(
          {
            batchId: batch.id, // ID del lote (padre)
            id: initialData.id, // ID del ajuste (hijo)
            data: adjustmentPayload,
          },
          {
            onSuccess: onClose,
          },
        );
      } else {
        recordAdjustment(adjustmentPayload, { onSuccess: onClose });
      }
    }
  };
  const handleQuickClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    // Payload limpio alineado a tu entidad de Spring Boot
    const payload = {
      name: newClientName.trim(),
      isInternalBranch: false,
      accountingEntity: null,
    };

    createClient(payload, {
      onSuccess: (savedClient: any) => {
        // 1. Cerramos el mini-formulario
        setIsAddingClient(false);
        setNewClientName("");
        // 2. Auto-seleccionamos el cliente recién creado en el formulario de React Hook Form
        setValue("clientId", savedClient.id);
      },
    });
  };

  return (
    <Modal show={true} onClose={onClose} size="lg">
      <ModalHeader className="border-b border-gray-700 bg-gray-800 text-white">
        <span className="flex items-center gap-2">
          {isEditing ? "Editar" : "Registrar"}{" "}
          {watchMovementType === "SALE" ? "Venta" : "Baja"}
        </span>
      </ModalHeader>
      <ModalBody className="bg-gray-800">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          {/* 1. Tipo de Movimiento (Radios con estilo) */}
          <div className="col-span-2 flex justify-center gap-6 rounded-lg bg-gray-700/30 p-4">
            <div className="flex items-center gap-2">
              <Radio
                {...register("movementType")}
                value="SALE"
                id="type-sale"
                disabled={isEditing} // <--- Deshabilitar en edición
              />
              <Label
                htmlFor="type-sale"
                className={`text-white ${isEditing ? "opacity-50" : ""}`}
              >
                Venta / Salida
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Radio
                {...register("movementType")}
                value="ADJUSTMENT"
                id="type-adj"
                disabled={isEditing} // <--- Deshabilitar en edición
              />
              <Label
                htmlFor="type-adj"
                className={`text-white ${isEditing ? "opacity-50" : ""}`}
              >
                Baja / Ajuste
              </Label>
            </div>
          </div>

          {/* 2. Fecha con Controller para Datepicker */}
          <div className="col-span-2 lg:col-span-1">
            <Label className="mb-2 block">Fecha de Movimiento</Label>
            <Controller
              control={control}
              name="saleDate"
              render={({ field }) => (
                <div className="relative">
                  <Datepicker
                    {...field}
                    language="es-MX"
                    value={
                      field.value
                        ? new Date(field.value + "T12:00:00")
                        : new Date()
                    }
                    onChange={(date) => {
                      if (date) {
                        // Convertimos el objeto Date a string YYYY-MM-DD antes de guardarlo en el formulario
                        field.onChange(toLocalDateString(date));
                      }
                    }}
                    inline={false} // Para que se comporte como un popover
                  />
                </div>
              )}
            />
          </div>

          {/* 3. Datos de Persona (Ventas) */}
          {watchMovementType === "SALE" && (
            <>
              <div className="col-span-2 lg:col-span-1">
                <Label className="mb-2 block">Vendedor / Empleado</Label>
                <Select
                  {...register("employeeId", { required: true })}
                  icon={HiUser}
                >
                  <option value="">Seleccionar empleado...</option>
                  {employees.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </div>
              {/* CONTENEDOR DEL SELECTOR DE CLIENTE CON BUSCADOR INTERNO */}
              <div className="relative col-span-2 lg:col-span-1">
                <div className="mb-2 flex items-center justify-between">
                  <Label>Cliente</Label>
                  {!isAddingClient && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingClient(true);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-1 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
                    >
                      <HiPlus className="h-3 w-3" /> Nuevo Cliente
                    </button>
                  )}
                </div>

                {!isAddingClient ? (
                  <div className="relative">
                    {/* Input de búsqueda simulando el Select */}
                    <div className="relative flex items-center">
                      <HiIdentification className="absolute left-3 z-10 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-600 bg-gray-700 py-2 pr-10 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Escribe para buscar cliente..."
                        value={
                          isDropdownOpen
                            ? searchTerm
                            : selectedClient?.name ||
                              "Cliente Mostrador / Venta Directa"
                        }
                        onFocus={() => {
                          setIsDropdownOpen(true);
                          setSearchTerm(""); // Limpia al enfocar para mostrar todos al inicio
                        }}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                      />
                      {/* Flecha indicadora de menú */}
                      <div
                        className="absolute right-3 flex cursor-pointer items-center text-gray-400"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

                    {/* Menú Desplegable Flotante (Dropdown) Filtrado */}
                    {isDropdownOpen && (
                      <>
                        {/* Capa invisible trasera para cerrar el menú si dan clic afuera */}
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsDropdownOpen(false)}
                        />

                        <ul className="absolute top-full left-0 z-30 mt-1 max-h-60 w-full divide-y divide-gray-800 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-1 shadow-xl">
                          {/* Opción default (Venta directa) */}
                          <li
                            className={`cursor-pointer rounded px-3 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white ${!selectedClientId ? "bg-blue-600/20 text-blue-400" : ""}`}
                            onClick={() => {
                              setValue("clientId", ""); // Mandamos vacío al form
                              setIsDropdownOpen(false);
                            }}
                          >
                            Cliente Mostrador / Venta Directa
                          </li>

                          {/* Opciones filtradas */}
                          {filteredClients.length > 0 ? (
                            filteredClients.map((c: any) => (
                              <li
                                key={c.id}
                                className={`cursor-pointer rounded px-3 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white ${Number(selectedClientId) === c.id ? "bg-blue-600/20 font-semibold text-blue-400" : ""}`}
                                onClick={() => {
                                  setValue("clientId", c.id); // Registramos el ID en el React Hook Form
                                  setIsDropdownOpen(false); // Cerramos menú
                                }}
                              >
                                {c.name}
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-center text-xs text-gray-500 italic">
                              No se encontraron clientes coincidentes
                            </li>
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                ) : (
                  /* Mini-formulario inline de creación ultra rápida (Mantenemos tu lógica anterior) */
                  <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/30 p-1.5">
                    <input
                      type="text"
                      className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Nombre del nuevo cliente..."
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      disabled={isCreatingClient}
                      required
                      autoFocus
                    />
                    <Button
                      size="xs"
                      color="blue"
                      type="button"
                      onClick={handleQuickClientSubmit}
                      disabled={isCreatingClient || !newClientName.trim()}
                    >
                      {isCreatingClient ? "..." : "Guardar"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingClient(false);
                        setNewClientName("");
                      }}
                      className="p-1 text-gray-500 hover:text-gray-400"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Input oculto para que React Hook Form mantenga el valor registrado nativamente si es necesario */}
                <input type="hidden" {...register("clientId")} />
              </div>
            </>
          )}

          {/* 4. Motivo (Bajas) */}
          {watchMovementType === "ADJUSTMENT" && (
            <div className="col-span-2 lg:col-span-1">
              <Label className="mb-2 block">Motivo del Ajuste</Label>
              <Select {...register("reason", { required: true })}>
                <option value="">Seleccione motivo...</option>
                <option value="MERMA">Merma por Peso (Deshidratación)</option>
                <option value="MUERTE">Muerte / Descarte</option>
                <option value="ROTURA">Rotura / Daño</option>
                <option value="CONSUMO">Consumo Interno</option>
              </Select>
            </div>
          )}

          <hr className="col-span-2 my-2 border-gray-700" />

          {/* 5. CAMPOS DINÁMICOS (Aquí se inyecta EggMovementFields o ChickenMovementFields) */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <MovementFields
              register={register}
              watch={watch}
              setValue={setValue} // 👈 ¡Listo! Ya no marcará error de TypeScript
              batch={batch}
            />
          </div>

          {/* 6. Total de Venta */}
          {watchMovementType === "SALE" && (
            <div className="col-span-2 rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
              <Label className="mb-2 block font-bold text-blue-300">
                Total a Cobrar ($)
              </Label>
              <TextInput
                type="number"
                step="0.01"
                {...register("saleTotal", { required: true })}
                icon={HiCurrencyDollar}
                className="text-lg font-bold"
              />
            </div>
          )}

          <div className="col-span-2 flex justify-end gap-3 border-t border-gray-700 pt-6">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button color="blue" type="submit" className="px-6">
              {isEditing ? "Guardar Cambios" : "Confirmar Movimiento"}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};
