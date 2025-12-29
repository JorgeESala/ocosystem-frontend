import { useEffect, useState } from "react";
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
import CreateRouteInlineForm from "./CreateRouteInlineForm";
import { useRoutes } from "../api/routes.queries";

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
    routeId: null as number | null,
    quantitySold: "",
    kgSold: "",
    kgSent: "",
    saleTotal: "",
    date: new Date(),
    employeeId: undefined as number | undefined,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showCreateRoute, setShowCreateRoute] = useState(false);

  /* =========================
     QUERIES / MUTATIONS
     ========================= */
  const { data: employees = [] } = useEmployees(JobPosition.DRIVER);

  const createMutation = useCreateInboundBatchSale(batch.id);
  const updateMutation = useUpdateInboundBatchSale(
    batch.id,
    existingSale?.id ?? 0,
  );
  const {
    data: routes = [],
    isLoading: routesLoading,
    isError: routesError,
  } = useRoutes();

  /* =========================
     EFFECTS
     ========================= */

  useEffect(() => {
    if (existingSale) {
      setFormData({
        routeId: Number(existingSale.routeId),
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
        routeId: Number(formData.routeId),
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
    <Modal show={true} onClose={onClose} size="md">
      <ModalHeader>
        {isEditMode ? "Editar venta" : "Nueva venta"} – Remesa #{batch.id}
      </ModalHeader>

      <ModalBody>
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
          <Select
            name="employeeId"
            value={formData.employeeId ?? ""}
            onChange={handleChange}
          >
            <option value="">Selecciona un chofer</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </Select>

          <div className="space-y-1">
            <Label>Ruta</Label>

            <div className="flex gap-2">
              <Select
                name="routeId"
                value={formData.routeId ?? ""}
                onChange={handleChange}
              >
                <option value="">
                  {routesLoading
                    ? "Cargando rutas..."
                    : routesError
                      ? "Error al cargar rutas"
                      : "Selecciona una ruta"}
                </option>

                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </Select>

              <Button
                size="sm"
                color="light"
                type="button"
                onClick={() => setShowCreateRoute(true)}
              >
                + Nueva
              </Button>
            </div>

            {showCreateRoute && (
              <CreateRouteInlineForm
                onCancel={() => setShowCreateRoute(false)}
                onCreated={(route) => {
                  setFormData((prev) => ({
                    ...prev,
                    routeId: route.id,
                  }));

                  setShowCreateRoute(false);
                }}
              />
            )}
          </div>

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

          <div className="mt-3 flex justify-between">
            <Button type="submit" disabled={createMutation.isPending}>
              Guardar
            </Button>
            <Button color="gray" type="button" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>

        {toastMessage && (
          <Toast className="mt-3">
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
      </ModalBody>
    </Modal>
  );
}
