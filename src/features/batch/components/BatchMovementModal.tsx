import {
  Button,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { HiCurrencyDollar, HiPlus } from "react-icons/hi";
import { useCreateBatchSale, useUpdateBatchSale } from "../api/batch.queries";
import type { Batch } from "../types.batch";
import { Controller, useForm } from "react-hook-form";
import { toLocalDateString } from "@/utils/date.utils";
import { useClients, useCreateClient } from "@/core/client/api/client.queries";
import {
  useCreateAdjustment,
  useUpdateBatchAdjustment,
} from "../api/batch.adjustments.queries";
import { useEmployeesByPositions } from "@/features/employee/api/employees.queries";
import { JobPosition } from "@/features/employee/types";

export const BatchMovementModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  initialData?: any;
}> = ({ batch, onClose, initialData }) => {
  const isEditing = !!initialData;
  // 1. Agregamos "movementType" al formulario
  const { register, handleSubmit, control, setValue, watch } = useForm<any>({
    defaultValues: isEditing
      ? {
          movementType: initialData.type,
          saleDate: initialData.date,
          boxes:
            initialData.type === "SALE"
              ? initialData.quantity || 0
              : Math.floor(initialData.quantity / 360),
          cartons:
            initialData.type === "SALE"
              ? 0
              : Math.floor((initialData.quantity % 360) / 30),
          quantity: initialData.type === "SALE" ? 0 : initialData.quantity % 30,
          weight: initialData.weight,
          saleTotal: initialData.saleTotal, // Solo si es venta
          reason: initialData.reason,
          employeeId: String(initialData.employeeId || ""),
          clientId: String(initialData.clientId || ""),
        }
      : {
          movementType: "SALE",
          saleDate: toLocalDateString(new Date()),
          boxes: 0,
          cartons: 0,
          quantity: 0,
        },
    values: initialData
      ? {
          ...initialData,
          movementType: initialData.type,
          saleDate: initialData.date,
          clientId: String(initialData.clientId || ""),
          employeeId: String(initialData.employeeId || ""),
          // Lógica de desglose unificada para Huevo
          boxes:
            batch.type === "EGG" ? Math.floor(initialData.quantity / 360) : 0,
          cartons:
            batch.type === "EGG"
              ? Math.floor((initialData.quantity % 360) / 30)
              : 0,
          quantity:
            batch.type === "EGG"
              ? initialData.quantity % 30
              : initialData.quantity, // Si es pollo, quantity son "cabezas"
        }
      : undefined,
  });

  const watchMovementType = watch("movementType");

  // Hooks de mutación
  const { mutate: recordSale, isPending: isSavingSale } = useCreateBatchSale();
  const { mutate: recordAdjustment, isPending: isSavingAdjustment } =
    useCreateAdjustment();
  const { mutate: updateSale } = useUpdateBatchSale();
  const { mutate: updateAdjustment } = useUpdateBatchAdjustment();

  const { data: employees = [], isLoading: loadingEmployees } =
    useEmployeesByPositions([JobPosition.DRIVER, JobPosition.OFFICE]);
  const { data: clients = [], isLoading: loadingClients } = useClients();
  const { mutate: createClient } = useCreateClient();

  const handleQuickAddClient = () => {
    const name = window.prompt("Nombre del nuevo cliente:");
    if (name && name.trim().length > 0) {
      createClient(
        { name },
        {
          onSuccess: (newClient: any) =>
            setValue("clientId", String(newClient.id)),
        },
      );
    }
  };
  const onSubmit = (data: any) => {
    const isSale = data.movementType === "SALE";

    if (isSale) {
      // Definimos el payload de Venta
      const salePayload = {
        batchId: batch.id,
        employeeId: Number(data.employeeId),
        clientId: Number(data.clientId),
        saleDate: data.saleDate,
        saleTotal: Number(data.saleTotal),
        boxes: Number(data.boxes || 0),
        cartons: Number(data.cartons || 0),
        quantity: Number(data.quantity || 0),
        weight: Number(data.weight || 0),
      };

      if (isEditing) {
        updateSale(
          { id: initialData.id, data: salePayload },
          { onSuccess: onClose },
        );
      } else {
        recordSale(salePayload, { onSuccess: onClose });
      }
    } else {
      // Definimos el payload de Ajuste (Aquí reason NO es undefined)
      const adjustmentPayload = {
        batchId: batch.id,
        quantity:
          Number(data.quantity || 0) +
          Number(data.boxes || 0) * 360 +
          Number(data.cartons || 0) * 30,
        weight: Number(data.weight || 0),
        reason: data.reason === "OTRO" ? data.otherReason : data.reason,
        adjustmentDate: data.saleDate,
      };

      if (isEditing) {
        updateAdjustment(
          { id: initialData.id, data: adjustmentPayload },
          { onSuccess: onClose },
        );
      } else {
        recordAdjustment(adjustmentPayload, { onSuccess: onClose });
      }
    }
  };
  return (
    <Modal show={true} onClose={onClose} size="lg">
      <ModalHeader>
        {isEditing ? "Editar" : "Registrar"}{" "}
        {watch("movementType") === "SALE" ? " Venta" : " Baja"}
      </ModalHeader>
      <ModalBody className="bg-gray-800">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          {/* SECTOR DE TIPO DE MOVIMIENTO */}
          <div className="col-span-2 flex gap-4 rounded-lg bg-gray-700/50 p-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                value="SALE"
                {...register("movementType")}
                id="typeSale"
              />
              <Label htmlFor="typeSale" className="cursor-pointer">
                Venta
              </Label>
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <input
                type="radio"
                value="ADJUSTMENT"
                {...register("movementType")}
                id="typeAdj"
              />
              <Label htmlFor="typeAdj" className="cursor-pointer text-red-400">
                Baja / Merma
              </Label>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <Label>Fecha</Label>
            <Controller
              control={control}
              name="saleDate"
              render={({ field }) => (
                <Datepicker
                  language="es-Mx"
                  value={
                    field.value
                      ? new Date(field.value + "T12:00:00")
                      : new Date()
                  }
                  onChange={(date) =>
                    date && field.onChange(toLocalDateString(date))
                  }
                />
              )}
            />
          </div>

          {/* CAMPOS CONDICIONALES DE VENTA */}
          {watchMovementType === "SALE" ? (
            <>
              <div className="col-span-1">
                <Label>Empleado</Label>
                {!loadingEmployees ? (
                  <Select {...register("employeeId", { required: true })}>
                    <option value="">Seleccionar...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="h-10 animate-pulse rounded bg-gray-700" /> // Skeleton loader
                )}
              </div>

              <div className="col-span-1">
                <div className="mb-1 flex items-center justify-between">
                  <Label>Cliente</Label>
                  <button
                    type="button"
                    onClick={handleQuickAddClient}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase hover:text-blue-300"
                  >
                    <HiPlus size={12} /> Nuevo
                  </button>
                </div>
                {!loadingClients ? (
                  <Select {...register("clientId", { required: true })}>
                    <option value="">Seleccionar Cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="h-10 animate-pulse rounded bg-gray-700" /> // Skeleton loader
                )}
              </div>
            </>
          ) : (
            /* CAMPOS CONDICIONALES DE BAJA */
            <div className="col-span-1">
              <Label>Motivo de la Baja</Label>
              <Select {...register("reason")}>
                <option value="ROTURA">Huevo Roto</option>
                <option value="CADUCADO">Huevo Caducado</option>
                <option value="CONSUMO">Consumo Interno</option>
                <option value="OTRO">Otro</option>
              </Select>
            </div>
          )}

          <hr className="col-span-2 border-gray-700" />

          {/* DESGLOSE FÍSICO (Común para ambos) */}
          {batch.type === "EGG" && (
            <>
              <div>
                <Label>Cajas</Label>
                <TextInput type="number" {...register("boxes")} />
              </div>
              <div>
                <Label>Casilleros</Label>
                <TextInput type="number" {...register("cartons")} />
              </div>
            </>
          )}

          <div>
            <Label>{batch.type === "EGG" ? "Piezas Sueltas" : "Cabezas"}</Label>
            <TextInput type="number" {...register("quantity")} />
          </div>

          <div>
            <Label>Peso Kg (Opcional)</Label>
            <TextInput type="number" step="0.01" {...register("weight")} />
          </div>

          {/* TOTAL SOLO PARA VENTAS */}
          {watchMovementType === "SALE" && (
            <div className="col-span-2">
              <Label>Total de Venta ($)</Label>
              <TextInput
                type="number"
                {...register("saleTotal", { required: true })}
                icon={HiCurrencyDollar}
              />
            </div>
          )}

          <div className="col-span-2 flex justify-end gap-2 border-t border-gray-700 pt-4">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSavingSale || isSavingAdjustment}>
              {isSavingSale || isSavingAdjustment ? (
                <Spinner size="sm" />
              ) : (
                "Confirmar Movimiento"
              )}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};
