import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Datepicker,
  Label,
  TextInput,
  Toast,
  ToastToggle,
} from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";

import type {
  InboundBatch,
  InboundBatchSale,
  CreateInboundBatchSalePayload,
  UpdateInboundBatchSalePayload,
} from "../types";

import {
  useCreateInboundBatchSale,
  useUpdateInboundBatchSale,
} from "../api/inboundBatchSales.queries";

import { useEmployees } from "@/features/employee/api/employees.queries";
import { JobPosition } from "@/features/employee/types";

interface SaleEntryFormProps {
  batch: InboundBatch;
  existingSale?: InboundBatchSale;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InboundBatchSaleEntryForm({
  batch,
  existingSale,
  onClose,
  onSuccess,
}: SaleEntryFormProps) {
  const isEditMode = !!existingSale;

  const [formData, setFormData] = useState({
    quantitySold: "",
    kgSold: "",
    kgSent: "",
    saleTotal: "",
    date: new Date(),
    employeeId: undefined as number | undefined,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  /* =========================
     QUERIES / MUTATIONS
     ========================= */

  const { data: employees = [] } = useEmployees(JobPosition.DRIVER);

  const createMutation = useCreateInboundBatchSale(batch.id);
  const updateMutation = useUpdateInboundBatchSale(
    batch.id,
    existingSale?.id ?? 0,
  );

  /* =========================
     EFFECTS
     ========================= */

  useEffect(() => {
    if (existingSale) {
      setFormData({
        quantitySold: String(existingSale.quantitySold),
        kgSold: String(existingSale.kgSold),
        kgSent: String(existingSale.kgSent),
        saleTotal: String(existingSale.saleTotal),
        date: new Date(existingSale.date),
        employeeId: existingSale.employeeId,
      });
    }
  }, [existingSale]);

  /* =========================
     HANDLERS
     ========================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.quantitySold ||
      !formData.kgSold ||
      !formData.kgSent ||
      !formData.saleTotal ||
      !formData.employeeId
    ) {
      setToastType("error");
      setToastMessage("Completa todos los campos");
      return;
    }

    if (isEditMode) {
      const payload: UpdateInboundBatchSalePayload = {
        id: existingSale!.id,
        batchId: batch.id,
        quantitySold: Number(formData.quantitySold),
        kgSold: Number(formData.kgSold),
        kgSent: Number(formData.kgSent),
        saleTotal: Number(formData.saleTotal),
        date: formData.date,
        employeeId: formData.employeeId,
      };

      updateMutation.mutate(payload, {
        onSuccess: () => {
          setToastType("success");
          setToastMessage("Venta actualizada correctamente");
          onSuccess?.();
          onClose();
        },
        onError: () => {
          setToastType("error");
          setToastMessage("Error al actualizar la venta");
        },
      });
    } else {
      const payload: CreateInboundBatchSalePayload = {
        batchId: batch.id,
        quantitySold: Number(formData.quantitySold),
        kgSold: Number(formData.kgSold),
        kgSent: Number(formData.kgSent),
        saleTotal: Number(formData.saleTotal),
        date: formData.date,
        employeeId: formData.employeeId,
      };

      createMutation.mutate(
        { payload },
        {
          onSuccess: () => {
            setToastType("success");
            setToastMessage("Venta registrada correctamente");
            onSuccess?.();
            onClose();
          },
          onError: () => {
            setToastType("error");
            setToastMessage("Error al registrar la venta");
          },
        },
      );
    }
  };

  /* =========================
     UI
     ========================= */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/25 p-4"
      onClick={onClose}
    >
      <Card
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
        >
          <HiX className="h-6 w-6" />
        </button>

        <h3 className="mb-2 text-lg font-semibold text-white">
          {isEditMode ? "Editar venta" : "Nueva venta"} – Remesa #{batch.id}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Label>Fecha</Label>
          <Datepicker
            language="es-MX"
            value={formData.date}
            onChange={(d) =>
              setFormData((prev) => ({ ...prev, date: d ?? new Date() }))
            }
          />

          <Label>Chofer</Label>
          <select
            name="employeeId"
            className="rounded-lg border border-gray-600 bg-gray-700 p-2 text-white"
            value={formData.employeeId ?? ""}
            onChange={handleChange}
          >
            <option value="">Selecciona un chofer</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <Label>Pollos vendidos</Label>
          <TextInput
            name="quantitySold"
            type="number"
            value={formData.quantitySold}
            onChange={handleChange}
          />

          <Label>Kilos enviados</Label>
          <TextInput
            name="kgSent"
            type="number"
            step="any"
            value={formData.kgSent}
            onChange={handleChange}
          />

          <Label>Kilos vendidos</Label>
          <TextInput
            name="kgSold"
            type="number"
            step="any"
            value={formData.kgSold}
            onChange={handleChange}
          />

          <Label>Efectivo recibido</Label>
          <TextInput
            name="saleTotal"
            type="number"
            step="any"
            value={formData.saleTotal}
            onChange={handleChange}
          />

          <div className="mt-2 flex justify-between">
            <Button type="submit" disabled={createMutation.isPending}>
              Guardar
            </Button>
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>

        {toastMessage && (
          <Toast className="mt-2">
            <div
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                toastType === "success"
                  ? "bg-green-100 text-green-500"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {toastType === "success" ? (
                <HiCheck className="h-5 w-5" />
              ) : (
                <HiX className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toastMessage}</div>
            <ToastToggle onClick={() => setToastMessage(null)} />
          </Toast>
        )}
      </Card>
    </div>
  );
}
