import React, { useEffect } from "react";
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
import type { BatchResponseDTO, BusinessUnitType } from "../types.batch";
import { useSuppliers } from "@/core/supplier/supplier.queries";
import { useCreateBatch, useUpdateBatch } from "../api/batch.queries";
import { Controller, useForm } from "react-hook-form";
import { toLocalDateString } from "@/utils/date.utils";
import { useCedis } from "@/core/cedis/api/cedis.queries";
import { UNIT_CONFIG } from "../config/unitConfig";
import { calculateEggUnits } from "@/utils/egg.utils";

export const BatchEntryForm: React.FC<{
  open: boolean;
  onClose: () => void;
  unitType: BusinessUnitType;
  initialData?: BatchResponseDTO;
}> = ({ open, onClose, unitType, initialData }) => {
  const config = UNIT_CONFIG[unitType];
  const EntryFields = config.entryFormFields;
  const isEditing = !!initialData;
  const { mutate: createBatch, isPending } = useCreateBatch();
  const { mutate: updateBatch, isPending: isUpdating } = useUpdateBatch();
  const { data: suppliers = [] } = useSuppliers();
  const { data: allCedis = [] } = useCedis();

  const getMetadataNumber = (...keys: string[]) => {
    const metadata = initialData?.metadata ?? {};
    const key = keys.find((item) => metadata[item] !== undefined);
    return key ? Number(metadata[key] || 0) : 0;
  };

  const getInitialValues = () => {
    const initialPieces = Number(initialData?.initialQuantity || 0);
    const {
      boxes: boxesFromQuantity,
      cartons: cartonsFromQuantity,
      pieces,
    } = calculateEggUnits(initialPieces);
    const cedisId =
      initialData?.debtorEntityId ??
      allCedis.find((cedis) => cedis.name === initialData?.cedisName)?.id ??
      1;

    return {
      entryDate: initialData?.entryDate ?? toLocalDateString(new Date()),
      supplierId: initialData?.supplierId ? String(initialData.supplierId) : "",
      cedisId: String(cedisId),
      quantity:
        unitType === "EGG" ? pieces : (initialData?.initialQuantity ?? ""),
      weight: getMetadataNumber("declared_weight", "weight"),
      realWeight: initialData?.weightReal ?? getMetadataNumber("realWeight"),
      pricePerKg: getMetadataNumber("pricePerKg", "price_per_kg"),
      boxes:
        getMetadataNumber("boxQuantity", "box_quantity") || boxesFromQuantity,
      cartons:
        getMetadataNumber("cartonQuantity", "carton_quantity") ||
        cartonsFromQuantity,
      totalAmount: initialData?.totalAmount ?? "",
    };
  };

  const { register, handleSubmit, reset, control, watch } = useForm<any>({
    defaultValues: getInitialValues(),
  });

  useEffect(() => {
    reset(getInitialValues());
  }, [allCedis, initialData, reset, unitType]);

  const onSubmit = (data: any) => {
    const isEggUnit = unitType === "EGG";

    const payload = {
      ...data,
      supplierId: Number(data.supplierId),
      debtorEntityId: Number(data.cedisId),
      type: unitType,
      weight: Number(data.weight || 0),
      realWeight: Number(data.realWeight || 0),
      quantity: Number(data.quantity || 0),
      pricePerKg: Number(data.pricePerKg || 0),
      ...(isEggUnit
        ? {
            boxQuantity: Number(data.boxes || 0),
            cartonQuantity: Number(data.cartons || 0),
          }
        : {}),
    };

    const mutationOptions = {
      onSuccess: () => {
        reset();
        onClose();
      },
    };

    if (isEditing && initialData) {
      updateBatch({ id: initialData.id, data: payload }, mutationOptions);
      return;
    }

    createBatch(payload, mutationOptions);
  };

  return (
    <Modal show={open} onClose={onClose} size="md">
      <ModalHeader className="bg-gray-800 text-white">
        {initialData ? "Editar" : "Nueva"} Remesa de {config.label}
      </ModalHeader>
      <ModalBody className="bg-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

            <EntryFields register={register} watch={watch} control={control} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || isUpdating}>
              {isPending || isUpdating ? (
                <Spinner size="sm" />
              ) : initialData ? (
                "Guardar Cambios"
              ) : (
                "Registrar Remesa"
              )}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};
