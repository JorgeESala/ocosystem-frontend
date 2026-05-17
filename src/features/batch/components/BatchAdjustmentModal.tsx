import { useForm } from "react-hook-form";
import type { Batch, BatchAdjustment, BusinessUnitType } from "../types.batch";
import { useCreateAdjustment } from "../api/batch.adjustments.queries";
import { toLocalDateString } from "@/utils/date.utils";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";

export const BatchAdjustmentModal: React.FC<{
  unitType: BusinessUnitType;
  batch: Batch;
  open: boolean;
  onClose: () => void;
}> = ({ unitType, batch, open, onClose }) => {
  const { register, handleSubmit, reset } = useForm<BatchAdjustment>();
  const { mutate: recordAdjustment, isPending } = useCreateAdjustment();

  const onSubmit = (data: any) => {
    recordAdjustment(
      {
        batchId: batch.id,
        weight: Number(data.weight || 0),
        quantity: Number(data.quantity || 0),
        reason: data.reason,
        adjustmentDate: toLocalDateString(new Date()),
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader />
      <ModalBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-xl font-medium text-white">
            Registrar Baja / Merma
          </h3>
          <p className="text-sm text-gray-400">Remesa #{batch.id}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Motivo de la baja</Label>
              <Select {...register("reason", { required: true })}>
                <option value="MERMA">Merma Natural</option>
                <option value="DAMAGED">Producto Dañado / Golpeado</option>
                <option value="CONSUMO">Consumo Interno</option>
                <option value="OTHER">Otro</option>
              </Select>
            </div>

            <div>
              <Label>Kilos</Label>
              <TextInput
                type="number"
                step="0.001"
                {...register("weight")}
                placeholder="0.000"
              />
            </div>

            {/* En el Modal de Ajuste */}
            <div>
              <Label>
                {unitType === "EGG" ? "Piezas (Unidades)" : "Pollos"}
              </Label>
              <TextInput
                type="number"
                {...register("quantity")}
                placeholder="Ej. 15"
              />
              {unitType === "EGG" && (
                <p className="mt-1 text-[10px] text-gray-500">
                  Si se rompió un casillero completo, registra 30 piezas.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button color="failure" type="submit" disabled={isPending}>
              {isPending ? <Spinner size="sm" /> : "Registrar Baja"}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};
