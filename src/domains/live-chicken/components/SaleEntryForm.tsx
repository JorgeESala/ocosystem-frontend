import React, { useEffect, useState } from "react";
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
import { Batch, DailyBatchSale } from "@/services/api";
// import { fetchEmployees } from "../../services/api";

interface SaleEntryFormProps {
  batch: Batch;
  existingSale?: DailyBatchSale;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SaleEntryForm({
  batch,
  existingSale,
  onClose,
  onSuccess,
}: SaleEntryFormProps) {
  const [formData, setFormData] = useState({
    id: existingSale ? existingSale.id : null,
    batchId: batch.id,
    quantitySold: existingSale ? String(existingSale.quantitySold) : "",
    kgTotal: existingSale ? String(existingSale.kgTotal) : "",
    saleTotal: existingSale ? existingSale.saleTotal : "",
    kgGut: existingSale ? String(existingSale.kgGut) : "",
    date: existingSale ? new Date(existingSale.date) : new Date(),
    employeeId: existingSale?.employee?.id || undefined,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>(
    [],
  );

  // Disables the scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    async function load() {
      setEmployees([
        {
          id: 1,
          name: "Jorge",
        },
        {
          id: 2,
          name: "Erick",
        },
        {
          id: 3,
          name: "Samuel",
        },
        {
          id: 4,
          name: "Shamir",
        },
      ]);
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, date: date ?? new Date() }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.quantitySold ||
      !formData.kgTotal ||
      !formData.saleTotal ||
      !formData.kgGut ||
      !formData.date
    ) {
      setToastType("error");
      setToastMessage("Completa todos los campos");
      return;
    }

    try {
      // if (formData.id) {
      //   await updateDailyBatchSale({
      //     id: formData.id,
      //     batchId: formData.batchId,
      //     quantitySold: Number(formData.quantitySold),
      //     kgTotal: Number(formData.kgTotal),
      //     saleTotal: Number(formData.saleTotal),
      //     kgGut: Number(formData.kgGut),
      //     date: formData.date,
      //     employeeId: formData.employeeId || undefined,
      //   });
      // } else {
      //   await createDailyBatchSale({
      //     batchId: formData.batchId,
      //     quantitySold: Number(formData.quantitySold),
      //     kgTotal: Number(formData.kgTotal),
      //     saleTotal: Number(formData.saleTotal),
      //     kgGut: Number(formData.kgGut),
      //     date: formData.date,
      //     employeeId: formData.employeeId || undefined,
      //   });
      // }

      setToastType("success");
      setToastMessage("Venta registrada correctamente");
      onSuccess?.();
      onClose();
    } catch {
      setToastType("error");
      setToastMessage("Error al registrar la venta");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex cursor-default items-center justify-center bg-gray-900/25 p-4"
      onClick={onClose} // closes the modal when the bg is clicked
    >
      <Card
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // prevents the modal from closing when clicked
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
        >
          <HiX className="h-6 w-6" />
        </button>

        <h3 className="mb-2 text-lg font-semibold text-white">
          Nueva venta - Remesa #{batch.id}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Label className="text-left">Fecha</Label>
          <Datepicker
            language="es-MX"
            value={formData.date}
            onChange={handleDateChange}
          />
          {/* <TextInput
            name="batchId"
            placeholder="Id de la remesa"
            disabled
            className="hidden"
            type="number"
            value={formData.batchId}
            onChange={handleChange}
          /> */}
          <Label className="text-left">Chofer</Label>
          <select
            name="employeeId"
            className="rounded-lg border border-gray-600 bg-gray-700 p-2 text-white"
            value={formData.employeeId ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                employeeId: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          >
            <option value="">Seleccione un chofer</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <Label className="text-left">Pollos vendidos</Label>
          <TextInput
            name="quantitySold"
            type="number"
            value={formData.quantitySold}
            onChange={handleChange}
          />
          <Label className="text-left">Kilos enviados</Label>
          <TextInput
            name="kgSent"
            type="number"
            step="any"
            value={formData.kgTotal}
            onChange={handleChange}
          />
          <Label className="text-left">Kilos vendidos</Label>
          <TextInput
            name="kgTotal"
            type="number"
            step="any"
            value={formData.kgTotal}
            onChange={handleChange}
          />
          <Label className="text-left">Efectivo recibido</Label>
          <TextInput
            name="saleTotal"
            type="number"
            step="any"
            value={formData.saleTotal}
            onChange={handleChange}
          />

          <div className="mt-2 flex justify-between">
            <Button type="submit">Guardar</Button>
            <Button type="button" color="gray" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>

        {toastMessage && (
          <Toast className="mt-2">
            <div
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${toastType === "success" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
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
