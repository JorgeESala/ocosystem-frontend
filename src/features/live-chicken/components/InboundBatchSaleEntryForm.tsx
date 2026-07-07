import { useEffect, useState } from "react";
import {
  Button,
  Datepicker,
  Label,
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
import type { Route } from "@/core/api/types";

import {
  useCreateInboundBatchSale,
  useUpdateInboundBatchSale,
} from "../api/inboundBatchSales.queries";

import { useEmployees } from "@/features/employee/api/employees.queries";
import { JobPosition } from "@/features/employee/types";
import CreateRouteInlineForm from "./CreateRouteInlineForm";
import { useRoutes } from "@/core/api/route/routes.queries";

interface SaleEntryFormProps {
  batch: InboundBatch;
  existingSale?: InboundBatchSale;
  onSuccess?: () => void;
}

export default function InboundBatchSaleEntryForm({
  batch,
  existingSale,
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

  const { data: employees = [] } = useEmployees(JobPosition.DRIVER);
  const { data: routes = [], isLoading, isError } = useRoutes();

  const createMutation = useCreateInboundBatchSale(batch.id);
  const updateMutation = useUpdateInboundBatchSale(
    batch.id,
    existingSale?.id ?? 0,
  );

  useEffect(() => {
    if (existingSale) {
      setFormData({
        routeId: existingSale.routeId ?? null,
        quantitySold: String(existingSale.quantitySold),
        kgSold: String(existingSale.kgSold),
        kgSent: String(existingSale.kgSent),
        saleTotal: String(existingSale.saleTotal),
        date: new Date(existingSale.date),
        employeeId: existingSale.employeeId,
      });
    }
  }, [existingSale]);
  const parseSelectNumber = (value: string): number | null =>
    value === "" ? null : Number(value);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "routeId" || name === "employeeId"
          ? parseSelectNumber(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.employeeId == null ||
      !formData.quantitySold ||
      !formData.kgSold ||
      !formData.kgSent ||
      !formData.saleTotal
    ) {
      setToastType("error");
      setToastMessage("Completa todos los campos");
      return;
    }

    const common = {
      batchId: batch.id,
      quantitySold: Number(formData.quantitySold),
      kgSold: Number(formData.kgSold),
      kgSent: Number(formData.kgSent),
      saleTotal: Number(formData.saleTotal),
      date: formData.date,
      employeeId: Number(formData.employeeId),
      ...(formData.routeId != null && {
        routeId: Number(formData.routeId),
      }),
    };

    if (isEditMode) {
      const payload: UpdateInboundBatchSalePayload = {
        id: existingSale!.id,
        ...common,
      };

      updateMutation.mutate(payload, {
        onSuccess: () => {
          setToastType("success");
          setToastMessage("Venta actualizada correctamente");
          onSuccess?.();
        },
      });
    } else {
      const payload: CreateInboundBatchSalePayload = {
        ...common,
      };

      createMutation.mutate(
        { payload },
        {
          onSuccess: () => {
            setToastType("success");
            setToastMessage("Venta registrada correctamente");
            onSuccess?.();
          },
        },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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

      <Label>Ruta</Label>
      <div className="flex gap-2">
        <Select
          name="routeId"
          value={formData.routeId ?? ""}
          onChange={handleChange}
        >
          <option value="">
            {isLoading
              ? "Cargando rutas..."
              : isError
                ? "Error al cargar rutas"
                : "Selecciona una ruta"}
          </option>
          {routes.map((route: Route) => (
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
            setFormData((prev) => ({ ...prev, routeId: route.id }));
            setShowCreateRoute(false);
          }}
        />
      )}

      <Label>Pollos vendidos</Label>
      <TextInput
        name="quantitySold"
        type="number"
        value={formData.quantitySold}
        onChange={handleChange}
        onWheel={(e) => e.currentTarget.blur()}
      />

      <Label>Kilos enviados</Label>
      <TextInput
        name="kgSent"
        type="number"
        step="any"
        value={formData.kgSent}
        onChange={handleChange}
        onWheel={(e) => e.currentTarget.blur()}
      />

      <Label>Kilos vendidos</Label>
      <TextInput
        name="kgSold"
        type="number"
        step="any"
        value={formData.kgSold}
        onChange={handleChange}
        onWheel={(e) => e.currentTarget.blur()}
      />

      <Label>Efectivo recibido</Label>
      <TextInput
        name="saleTotal"
        type="number"
        step="any"
        value={formData.saleTotal}
        onChange={handleChange}
        onWheel={(e) => e.currentTarget.blur()}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button color="gray" type="button">
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          Guardar
        </Button>
      </div>

      {toastMessage && (
        <Toast className="mt-3">
          <div
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
              toastType === "success"
                ? "bg-green-100 text-green-500"
                : "bg-red-100 text-red-500"
            }`}
          >
            {toastType === "success" ? <HiCheck /> : <HiX />}
          </div>
          <div className="ml-3 text-sm">{toastMessage}</div>
          <ToastToggle onClick={() => setToastMessage(null)} />
        </Toast>
      )}
    </form>
  );
}
