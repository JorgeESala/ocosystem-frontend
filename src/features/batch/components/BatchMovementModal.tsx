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
  HiLocationMarker,
} from "react-icons/hi";
import { UNIT_CONFIG } from "../config/unitConfig";
import { useCreateBatchSale, useUpdateBatchSale } from "../api/batch.queries";
import {
  useCreateAdjustment,
  useUpdateBatchAdjustment,
} from "../api/batch.adjustments.queries";
import { useEmployees } from "@/features/employee/api/employees.queries";
import { useClients, useCreateClient } from "@/core/client/api/client.queries";
import { useLocalities } from "@/core/locality/api/locality.queries";
import type { ClientCreateRequestDTO } from "@/core/client/api/client.api";
import CreateLocalityInlineForm from "./CreateLocalityInlineForm";
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
  const BRANCH_BADGE = "Interno";

  // --- ESTADOS PARA CREACIÓN RÁPIDA DE CLIENTE ---
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientLocalityId, setNewClientLocalityId] = useState<string>("");
  const [localitySearchTerm, setLocalitySearchTerm] = useState("");
  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);
  const [isAddingLocality, setIsAddingLocality] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { mutate: createClient, isPending: isCreatingClient } =
    useCreateClient();
  const { data: localities = [] } = useLocalities();

  const filteredLocalities = localities.filter((l) =>
    l.name.toLowerCase().includes(localitySearchTerm.toLowerCase()),
  );
  const selectedLocality = localities.find(
    (l) => String(l.id) === newClientLocalityId,
  );
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
  const term = searchTerm.toLowerCase();
  const matchingClients = clients.filter((c: any) => {
    const name = (c.name ?? "").toLowerCase();
    const business = (c.businessName ?? "").toLowerCase();
    return name.includes(term) || business.includes(term);
  });
  const branchClients = matchingClients.filter((c: any) => c.isInternalBranch);
  const regularClients = matchingClients.filter(
    (c: any) => !c.isInternalBranch,
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
  const onValid = (data: any) => {
    setSubmitError(null);
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
          {
            onSuccess: onClose,
            onError: (error: unknown) =>
              setSubmitError(
                error instanceof Error
                  ? error.message
                  : "No se pudo guardar la venta",
              ),
          },
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
            onError: (error: unknown) =>
              setSubmitError(
                error instanceof Error
                  ? error.message
                  : "No se pudo guardar la baja",
              ),
          },
        );
      } else {
        recordAdjustment(adjustmentPayload, { onSuccess: onClose });
      }
    }
  };

  const onInvalid = (errors: any) => {
    const firstKey = Object.keys(errors)[0];
    const firstError = firstKey ? errors[firstKey] : null;
    const label =
      firstKey === "employeeId"
        ? "Vendedor / Empleado"
        : firstKey === "saleTotal"
          ? "Total a Cobrar"
          : firstKey === "weight"
            ? "Peso Kg"
            : firstKey === "quantity"
              ? "Cantidad"
              : firstKey === "kgSent"
                ? "KG Enviados"
                : firstKey === "routeId"
                  ? "Ruta"
                  : firstKey === "reason"
                    ? "Motivo"
                    : firstKey;
    setSubmitError(
      firstError?.message
        ? `${label}: ${firstError.message}`
        : `Revisa el campo "${label}" antes de guardar`,
    );
  };

  const onSubmit = handleSubmit(onValid, onInvalid);
  const handleQuickClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setClientError(null);

    const payload: ClientCreateRequestDTO = {
      name: newClientName.trim(),
      isInternalBranch: false,
      accountingEntityId: null,
      localityId: newClientLocalityId ? Number(newClientLocalityId) : null,
    };

    createClient(payload, {
      onSuccess: (savedClient) => {
        setIsAddingClient(false);
        setNewClientName("");
        setNewClientLocalityId("");
        setLocalitySearchTerm("");
        setIsLocalityDropdownOpen(false);
        setIsAddingLocality(false);
        setValue("clientId", savedClient.id);
      },
      onError: (error: Error) => {
        setClientError(error.message || "No se pudo crear el cliente");
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
          onSubmit={onSubmit}
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
                    <div className="flex items-center gap-1.5">
                      {selectedClient?.isInternalBranch && (
                        <span className="rounded bg-blue-800 px-1.5 py-0.5 text-[10px] font-semibold text-blue-200">
                          {BRANCH_BADGE}
                        </span>
                      )}
                      <div className="relative flex-1">
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
                              setValue("clientId", "");
                              setIsDropdownOpen(false);
                            }}
                          >
                            Cliente Mostrador / Venta Directa
                          </li>

                          {/* Opciones filtradas, agrupadas por tipo */}
                          {branchClients.length + regularClients.length > 0 ? (
                            <>
                              {branchClients.length > 0 && (
                                <>
                                  <li className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.18em] text-gray-500 uppercase">
                                    Clientes internos
                                  </li>
                                  {branchClients.map((c: any) => (
                                    <li
                                      key={c.id}
                                      className={`cursor-pointer rounded px-3 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white ${Number(selectedClientId) === c.id ? "bg-blue-600/20 font-semibold text-blue-400" : ""}`}
                                      onClick={() => {
                                        setValue("clientId", c.id);
                                        setIsDropdownOpen(false);
                                      }}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <span className="rounded bg-blue-800 px-1.5 py-0.5 text-[10px] font-semibold text-blue-200">
                                          {BRANCH_BADGE}
                                        </span>
                                        <div className="leading-tight">
                                          {c.name}
                                        </div>
                                      </div>
                                      {(c.businessName || c.localityName) && (
                                        <div className="ml-[42px] text-[10px] text-gray-500">
                                          {c.businessName}
                                          {c.businessName && c.localityName && " · "}
                                          {c.localityName}
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </>
                              )}
                              {regularClients.length > 0 && (
                                <>
                                  <li className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.18em] text-gray-500 uppercase">
                                    Clientes externos
                                  </li>
                                  {regularClients.map((c: any) => (
                                    <li
                                      key={c.id}
                                      className={`cursor-pointer rounded px-3 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white ${Number(selectedClientId) === c.id ? "bg-blue-600/20 font-semibold text-blue-400" : ""}`}
                                      onClick={() => {
                                        setValue("clientId", c.id);
                                        setIsDropdownOpen(false);
                                      }}
                                    >
                                      <div className="leading-tight">
                                        {c.name}
                                      </div>
                                      {(c.businessName || c.localityName) && (
                                        <div className="text-[10px] text-gray-500">
                                          {c.businessName}
                                          {c.businessName && c.localityName && " · "}
                                          {c.localityName}
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </>
                              )}
                            </>
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
                  <div className="space-y-2 rounded-lg border border-gray-700 bg-gray-900/30 p-2">
                    <div className="flex items-center gap-2">
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
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] tracking-wider text-gray-400 uppercase">
                          Localidad (opcional)
                        </span>
                        {!isAddingLocality && (
                          <button
                            type="button"
                            onClick={() => setIsAddingLocality(true)}
                            className="flex items-center gap-1 text-[11px] font-medium text-blue-400 transition-colors hover:text-blue-300"
                          >
                            <HiPlus className="h-3 w-3" /> Nueva Localidad
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <div className="relative flex items-center">
                          <HiLocationMarker className="absolute left-2 z-10 h-4 w-4 text-gray-500" />
                          <input
                            type="text"
                            className="w-full rounded-lg border border-gray-600 bg-gray-700 py-1.5 pr-7 pl-7 text-xs text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Escribe para buscar localidad..."
                            value={
                              isLocalityDropdownOpen
                                ? localitySearchTerm
                                : selectedLocality?.name || ""
                            }
                            onFocus={() => {
                              setIsLocalityDropdownOpen(true);
                              setLocalitySearchTerm("");
                            }}
                            onChange={(e) => {
                              setLocalitySearchTerm(e.target.value);
                              setIsLocalityDropdownOpen(true);
                            }}
                            disabled={isCreatingClient || isAddingLocality}
                          />
                          <div
                            className="absolute right-2 flex cursor-pointer items-center text-gray-400"
                            onClick={() =>
                              !isCreatingClient &&
                              !isAddingLocality &&
                              setIsLocalityDropdownOpen(!isLocalityDropdownOpen)
                            }
                          >
                            <svg
                              className="h-3 w-3"
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

                        {isLocalityDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setIsLocalityDropdownOpen(false)}
                            />

                            <ul className="absolute top-full left-0 z-30 mt-1 max-h-48 w-full divide-y divide-gray-800 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-1 shadow-xl">
                              <li
                                className={`cursor-pointer rounded px-3 py-1.5 text-xs text-gray-300 hover:bg-blue-600 hover:text-white ${!newClientLocalityId ? "bg-blue-600/20 text-blue-400" : ""}`}
                                onClick={() => {
                                  setNewClientLocalityId("");
                                  setIsLocalityDropdownOpen(false);
                                }}
                              >
                                Sin localidad
                              </li>

                              {filteredLocalities.length > 0 ? (
                                filteredLocalities.map((l) => (
                                  <li
                                    key={l.id}
                                    className={`cursor-pointer rounded px-3 py-1.5 text-xs text-gray-300 hover:bg-blue-600 hover:text-white ${String(newClientLocalityId) === String(l.id) ? "bg-blue-600/20 font-semibold text-blue-400" : ""}`}
                                    onClick={() => {
                                      setNewClientLocalityId(String(l.id));
                                      setIsLocalityDropdownOpen(false);
                                    }}
                                  >
                                    {l.name}
                                  </li>
                                ))
                              ) : (
                                <li className="px-3 py-1.5 text-center text-xs text-gray-500 italic">
                                  No se encontraron localidades
                                </li>
                              )}
                            </ul>
                          </>
                        )}
                      </div>
                      {isAddingLocality && (
                        <CreateLocalityInlineForm
                          onCancel={() => setIsAddingLocality(false)}
                          onCreated={(locality) => {
                            setNewClientLocalityId(String(locality.id));
                            setIsLocalityDropdownOpen(false);
                            setIsAddingLocality(false);
                          }}
                        />
                      )}
                    </div>
                    {clientError && (
                      <p className="text-[11px] text-red-400">{clientError}</p>
                    )}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingClient(false);
                          setNewClientName("");
                          setNewClientLocalityId("");
                          setLocalitySearchTerm("");
                          setIsLocalityDropdownOpen(false);
                          setIsAddingLocality(false);
                          setClientError(null);
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
                      <Button
                        size="xs"
                        color="blue"
                        type="button"
                        onClick={handleQuickClientSubmit}
                        disabled={isCreatingClient || !newClientName.trim()}
                      >
                        {isCreatingClient ? "..." : "Guardar"}
                      </Button>
                    </div>
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

          {submitError && (
            <div className="col-span-2 rounded-lg border border-red-700 bg-red-900/30 px-4 py-2 text-sm text-red-200">
              {submitError}
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
