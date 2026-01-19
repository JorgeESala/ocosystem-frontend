import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Button,
  Card,
  Datepicker,
  Label,
  Select,
  TextInput,
  Toast,
  ToastToggle,
} from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";
import {
  Batch,
  createDailyBatchSale,
  DailyBatchSale,
  updateDailyBatchSale,
} from "../services/api";
import { fetchEmployees } from "../services/api";
import { useClients } from "@/features/processed/client/api/client.queries";
import CreateClientInlineForm from "./CreateClientInlineForm";

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
    clientId: existingSale?.client?.id ?? undefined,
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
  const [showCreateClient, setShowCreateClient] = useState(false);

  const {
    data: clients = [],
    isLoading: isLoadingClients,
    isError: isErrorClients,
  } = useClients();
  const queryClient = useQueryClient();

  // Disables the scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    async function load() {
      const data = await fetchEmployees();
      setEmployees(data);
    }
    load();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        value === "" ? undefined : name.endsWith("Id") ? Number(value) : value,
    }));
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
      if (formData.id) {
        await updateDailyBatchSale({
          id: formData.id,
          batchId: formData.batchId,
          quantitySold: Number(formData.quantitySold),
          kgTotal: Number(formData.kgTotal),
          saleTotal: Number(formData.saleTotal),
          kgGut: Number(formData.kgGut),
          date: formData.date,
          employeeId: formData.employeeId || undefined,
          clientId: formData.clientId || undefined,
        });
      } else {
        await createDailyBatchSale({
          batchId: formData.batchId,
          quantitySold: Number(formData.quantitySold),
          kgTotal: Number(formData.kgTotal),
          saleTotal: Number(formData.saleTotal),
          kgGut: Number(formData.kgGut),
          date: formData.date,
          employeeId: formData.employeeId || undefined,
          clientId: formData.clientId || undefined,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["batchSales", batch.id] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
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

          <Label className="text-left">Encargado</Label>
          <select
            required
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
            <option value="">Seleccione un encargado</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <Label>Cliente</Label>

          <div className="flex gap-2">
            <Select
              name="clientId"
              value={formData.clientId ?? ""}
              onChange={handleChange}
            >
              <option value="">
                {isLoadingClients
                  ? "Cargando clientes..."
                  : isErrorClients
                    ? "Error al cargar clientes"
                    : "Selecciona un cliente"}
              </option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </Select>

            <Button
              size="sm"
              color="light"
              type="button"
              onClick={() => setShowCreateClient(true)}
            >
              + Nuevo
            </Button>
          </div>

          {showCreateClient && (
            <CreateClientInlineForm
              onCancel={() => setShowCreateClient(false)}
              onCreated={(client) => {
                setFormData((prev) => ({ ...prev, clientId: client.id }));
                setShowCreateClient(false);
              }}
            />
          )}

          <Label className="text-left">Pollos vendidos</Label>
          <TextInput
            name="quantitySold"
            type="number"
            value={formData.quantitySold}
            onChange={handleChange}
            required
          />
          <Label className="text-left">Kilos vendidos</Label>
          <TextInput
            required
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
          <Label className="text-left">Kilos de tripa</Label>
          <TextInput
            name="kgGut"
            type="number"
            step="any"
            value={formData.kgGut}
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
