import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Button,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  TextInput,
  Toast,
  ToastToggle,
} from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";
import {
  Batch,
  createDailyBatchSale,
  updateDailyBatchSale,
  type BranchesBatchSale,
} from "../services/api";
import { fetchEmployees } from "../services/api";
import { useClients } from "@/features/processed/client/api/client.queries";
import CreateClientInlineForm from "./CreateClientInlineForm";
import { ExcelDropzone } from "@/features/branches/report-reader/components/ExcelDropzone";
import { http } from "@/shared/api/http";
import type {
  ExtractExcelResponse,
  ReportBatchSale,
} from "@/features/branches/batch/batch-sale/types";
import { stringToDate } from "@/utils/date.utils";

interface SaleEntryFormProps {
  batch: Batch;
  existingSale?: BranchesBatchSale;
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
    clientId: existingSale?.clientId ?? undefined,
    quantitySold: existingSale ? String(existingSale.quantitySold) : "",
    kgTotal: existingSale ? String(existingSale.kgTotal) : "",
    saleTotal: existingSale ? existingSale.saleTotal : "",
    kgGut: existingSale ? String(existingSale.kgGut) : "",
    date: existingSale ? stringToDate(existingSale.date) : new Date(),
    employeeId: existingSale?.employeeId || undefined,
  });

  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [detectedBatches, setDetectedBatches] = useState<ReportBatchSale[]>([]);
  const [showBatchSelector, setShowBatchSelector] = useState(false);
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
  const handleExcelUpload = async (file: File) => {
    setIsProcessingExcel(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batchId", String(batch.id));

      const { data } = await http.post<ExtractExcelResponse>(
        "/api/batchSales/extract-from-excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const { batches } = data;

      if (!batches?.length) {
        throw new Error("El archivo no contiene datos válidos");
      }

      // Caso 1: solo una remesa → autocompletar
      if (batches.length === 1) {
        handleBatchSelect(batches[0]);

        setToastType("success");
        setToastMessage("Datos cargados correctamente desde Excel");
        return;
      }

      // Caso 2: múltiples remesas → pedir selección
      setDetectedBatches(batches);
      setShowBatchSelector(true);
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al procesar el Excel";

      setToastType("error");
      setToastMessage(message);
    } finally {
      setIsProcessingExcel(false);
    }
  };

  const handleBatchSelect = (batch: ReportBatchSale) => {
    console.log("Batch " + batch.date);
    setFormData((prev) => ({
      ...prev,
      quantitySold: String(batch.quantitySold),
      kgTotal: String(batch.kgTotal),
      saleTotal: batch.saleTotal,
      kgGut: String(batch.kgGut),
      date: stringToDate(batch.date),
      employeeId: batch.employeeId ?? undefined,
      clientId: batch.clientId ?? undefined,
    }));

    setShowBatchSelector(false);

    setToastType("success");
    setToastMessage("Remesa cargada correctamente");
  };
  return (
    <Modal show={true} onClose={onClose} size="md" popup>
      <ModalHeader>Nueva venta - Remesa #{batch.id}</ModalHeader>

      <ModalBody>
        <div className="space-y-3">
          {/* Excel uploader */}
          <ExcelDropzone
            multiple={false}
            onFilesSelect={(files) => handleExcelUpload(files[0])}
            className="p-3 text-sm"
            text={
              isProcessingExcel
                ? "Procesando archivo..."
                : "Arrastra un archivo excel aquí"
            }
          />
          {showBatchSelector && (
            <div className="rounded-lg border border-yellow-500 bg-yellow-900/20 p-3">
              <p className="mb-2 text-sm font-semibold text-white">
                Se detectaron múltiples remesas en el archivo
              </p>

              <div className="flex flex-col gap-2">
                {detectedBatches.map((batch, index) => (
                  <Button
                    key={index}
                    color="light"
                    type="button"
                    onClick={() => handleBatchSelect(batch)}
                  >
                    Remesa {index + 1} — {batch.quantitySold} pollos — $
                    {batch.saleTotal}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Label>Fecha</Label>
            <Datepicker
              language="es-MX"
              value={formData.date}
              onChange={handleDateChange}
            />

            <Label>Encargado</Label>
            <select
              required
              name="employeeId"
              className="rounded-lg border border-gray-600 bg-gray-700 p-2 text-white"
              value={formData.employeeId ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  employeeId: e.target.value
                    ? Number(e.target.value)
                    : undefined,
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
                  setFormData((prev) => ({
                    ...prev,
                    clientId: client.id,
                  }));
                  setShowCreateClient(false);
                }}
              />
            )}

            <Label>Pollos vendidos</Label>
            <TextInput
              name="quantitySold"
              type="number"
              value={formData.quantitySold}
              onChange={handleChange}
              required
            />

            <Label>Kilos vendidos</Label>
            <TextInput
              required
              name="kgTotal"
              type="number"
              step="any"
              value={formData.kgTotal}
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

            <Label>Kilos de tripa</Label>
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
            <Toast>
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
        </div>
      </ModalBody>
    </Modal>
  );
}
