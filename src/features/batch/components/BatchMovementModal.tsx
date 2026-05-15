import React, { useEffect } from "react";
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
import { HiCurrencyDollar, HiUser, HiIdentification } from "react-icons/hi";
import { UNIT_CONFIG } from "../config/unitConfig";
import { useCreateBatchSale, useUpdateBatchSale } from "../api/batch.queries";
import {
  useCreateAdjustment,
  useUpdateBatchAdjustment,
} from "../api/batch.adjustments.queries";
import { useEmployees } from "@/features/employee/api/employees.queries";
import { useClients } from "@/core/client/api/client.queries";
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
              <div className="col-span-2 lg:col-span-1">
                <Label className="mb-2 block">Cliente</Label>
                <Select {...register("clientId")} icon={HiIdentification}>
                  <option value="">Cliente Mostrador / Venta Directa</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
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
            <MovementFields register={register} watch={watch} batch={batch} />
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
