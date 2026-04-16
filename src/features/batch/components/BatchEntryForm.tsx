import React, { useEffect } from "react";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Select,
  Spinner,
  ModalHeader,
  ModalBody,
  Datepicker,
} from "flowbite-react";
import type { Batch, BusinessUnitType } from "../types.batch";
import { useSuppliers } from "@/core/supplier/supplier.queries";
import { useCreateBatch } from "../api/batch.queries";
import { Controller, useForm } from "react-hook-form";
import { toLocalDateString } from "@/utils/date.utils";
import { useCedis } from "@/core/cedis/api/cedis.queries";

interface BatchEntryFormData {
  supplierId: string;
  entryDate: string;
  cedisId: string;
  boxes: number;
  cartons: number;
  quantity: number;
  weight: number;
  pricePerKg: number;
  purchaseMode: "KILO" | "BOX";
  totalPaid: number;
}

export const BatchEntryForm: React.FC<{
  open: boolean;
  onClose: () => void;
  unitType: BusinessUnitType;
  initialData?: Batch;
}> = ({ open, onClose, unitType, initialData }) => {
  const { register, handleSubmit, reset, control, watch } =
    useForm<BatchEntryFormData>({
      defaultValues: {
        purchaseMode: "BOX",
        cedisId: "1",
        entryDate: toLocalDateString(new Date()),
        boxes: 0,
        cartons: 0,
        quantity: 0,
        weight: 0,
        pricePerKg: 0,
        totalPaid: 0,
      },
    });

  // Observadores de estado para la UI dinámica y cálculos
  const watchMode = watch("purchaseMode");
  const watchBoxes = watch("boxes") || 0;
  const watchCartons = watch("cartons") || 0;
  const watchTotalPaid = watch("totalPaid") || 0;

  // Cálculo de costo informativo para el usuario
  const totalCartons = Number(watchBoxes) * 12 + Number(watchCartons);
  const pricePerCarton =
    totalCartons > 0 ? (Number(watchTotalPaid) / totalCartons).toFixed(2) : 0;

  const { mutate: createBatch, isPending } = useCreateBatch();
  const { data: suppliers = [] } = useSuppliers();
  const { data: allCedis = [] } = useCedis();
  const isEdit = !!initialData;

  const onSubmit = (data: BatchEntryFormData) => {
    const payload = {
      supplierId: Number(data.supplierId),
      debtorEntityId: Number(data.cedisId),
      type: unitType,
      entryDate: data.entryDate,
      weight: Number(data.weight || 0),
      pricePerKg: Number(data.pricePerKg || 0),
      // Mapeo crucial: si es modo BOX, enviamos el totalPaid como manualTotalAmount
      manualTotalAmount:
        data.purchaseMode === "BOX" ? Number(data.totalPaid) : null,
      boxQuantity: Number(data.boxes || 0),
      cartonQuantity: Number(data.cartons || 0),
      quantity: Number(data.quantity || 0),
    };

    if (isEdit) {
      // updateBatch logic...
    } else {
      createBatch(payload, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  useEffect(() => {
    if (initialData) {
      reset({
        supplierId: String(initialData.supplierId),
        entryDate: initialData.entryDate,
        boxes: initialData.metadata.box_quantity || 0,
        cartons: initialData.metadata.carton_quantity || 0,
        quantity: initialData.metadata.quantity || 0,
        weight: initialData.metadata.weight || 0,
        pricePerKg: initialData.metadata.price_per_kg || 0,
        purchaseMode:
          initialData.totalAmount > 0 && initialData.metadata.price_per_kg === 0
            ? "BOX"
            : "KILO",
        totalPaid: initialData.totalAmount || 0,
      });
    } else {
      reset({
        purchaseMode: "BOX",
        cedisId: "1",
        entryDate: toLocalDateString(new Date()),
        boxes: 0,
        cartons: 0,
        quantity: 0,
      });
    }
  }, [initialData, reset, allCedis]);

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader />
      <ModalBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-xl font-medium text-white">
            {isEdit ? "Editar" : "Nueva"} Remesa ({unitType})
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* 1. Selector de Modo */}
            <div className="col-span-2">
              <Label>Modo de compra</Label>
              <Select {...register("purchaseMode")}>
                <option value="BOX">Por Caja / Casillero</option>
                <option value="KILO">Por Kilo</option>
              </Select>
            </div>

            {/* 2. Campos Comunes */}
            <div className="col-span-2">
              <Label>Proveedor</Label>
              <Select {...register("supplierId", { required: true })}>
                <option value="">Selecciona un proveedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="col-span-2">
              <Label>CEDIS que recibió</Label>
              <Select {...register("cedisId", { required: true })}>
                <option value="">Selecciona el CEDIS</option>
                {allCedis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Fecha</Label>
              <Controller
                control={control}
                name="entryDate"
                render={({ field }) => (
                  <Datepicker
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

            {/* 3. Lógica DINÁMICA */}
            {watchMode === "KILO" ? (
              <>
                <div className="col-span-1">
                  <Label>Peso Total (Kg)</Label>
                  <TextInput
                    type="number"
                    step="0.001"
                    {...register("weight")}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-1">
                  <Label>Precio por Kg</Label>
                  <TextInput
                    type="number"
                    step="0.01"
                    {...register("pricePerKg")}
                    placeholder="0.00"
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <Label>Total Pagado ($)</Label>
                <TextInput
                  type="number"
                  step="0.01"
                  {...register("totalPaid", { required: true })}
                  placeholder="Monto total de la factura"
                />
                {totalCartons > 0 && (
                  <p className="mt-1 text-xs text-green-400">
                    Costo calculado: ${pricePerCarton} por casillero
                  </p>
                )}
              </div>
            )}

            {/* Seccion de inventario fisico - Siempre util para Huevo */}
            {unitType === "EGG" && (
              <>
                <div className="col-span-1">
                  <Label>Cajas</Label>
                  <TextInput type="number" {...register("boxes")} />
                </div>
                <div className="col-span-1">
                  <Label>Casilleros</Label>
                  <TextInput type="number" {...register("cartons")} />
                </div>
              </>
            )}

            {/* Peso opcional en modo BOX
            {watchMode === "BOX" && (
              <div className="col-span-2">
                <Label>Peso Total (Opcional)</Label>
                <TextInput
                  type="number"
                  step="0.001"
                  {...register("weight")}
                  placeholder="Kg totales"
                />
              </div>
            )} */}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner size="sm" /> : "Registrar"}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};
