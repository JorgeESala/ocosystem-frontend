import React from "react";
import {
  Modal,
  Button,
  Label,
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
import { UNIT_CONFIG } from "../config/unitConfig";

export const BatchEntryForm: React.FC<{
  open: boolean;
  onClose: () => void;
  unitType: BusinessUnitType;
  initialData?: Batch;
}> = ({ open, onClose, unitType, initialData }) => {
  const config = UNIT_CONFIG[unitType];
  const EntryFields = config.entryFormFields;

  const { register, handleSubmit, reset, control, watch } = useForm<any>({
    defaultValues: {
      entryDate: toLocalDateString(new Date()),
      cedisId: "1",
    },
  });

  const { mutate: createBatch, isPending } = useCreateBatch();
  const { data: suppliers = [] } = useSuppliers();
  const { data: allCedis = [] } = useCedis();

  const onSubmit = (data: any) => {
    // Payload genérico: enviamos todo, el backend filtrará por Strategy
    const payload = {
      ...data,
      supplierId: Number(data.supplierId),
      debtorEntityId: Number(data.cedisId),
      type: unitType,
      // Normalizamos campos numéricos
      weight: Number(data.weight || 0),
      realWeight: Number(data.realWeight || 0),
      quantity: Number(data.quantity || 0),
      boxQuantity: Number(data.boxes || 0),
      cartonQuantity: Number(data.cartons || 0),
      pricePerKg: Number(data.pricePerKg || 0),
    };

    createBatch(payload, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal show={open} onClose={onClose} size="md">
      <ModalHeader className="bg-gray-800 text-white">
        {initialData ? "Editar" : "Nueva"} Remesa de {config.label}
      </ModalHeader>
      <ModalBody className="bg-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 1. SECTOR COMÚN */}
            <div className="col-span-2">
              <Label>Proveedor</Label>
              <Select {...register("supplierId", { required: true })}>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <Label>CEDIS</Label>
              <Select {...register("cedisId")}>
                {allCedis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <Label>Fecha</Label>
              <Controller
                control={control}
                name="entryDate"
                render={({ field }) => (
                  <Datepicker
                    language="es-MX"
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

            <hr className="col-span-2 border-gray-700" />

            {/* 2. SECTOR DINÁMICO */}
            <EntryFields register={register} watch={watch} control={control} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner size="sm" /> : "Registrar Remesa"}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};
