import { useEffect, useState } from "react";
import {
  Label,
  Select,
  TextInput,
  Button,
  Datepicker,
  Modal,
  ModalHeader,
  ModalBody,
} from "flowbite-react";

import {
  type InboundBatch,
  type InboundBatchFormValues,
} from "@/features/live-chicken/types";
import { getSuppliers } from "../api/suppliers.api";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean;
  mode?: "create" | "edit";
  batch?: InboundBatch;
  onClose: () => void;
  onSubmit: (values: InboundBatchFormValues) => void;
}

export default function InboundBatchEntryForm({
  open,
  mode = "create",
  batch,
  onClose,
  onSubmit,
}: Props) {
  const [formValues, setFormValues] = useState<InboundBatchFormValues>({
    supplierId: null,
    date: new Date(),
    realWeight: "",
    declaredWeight: "",
    chickenQuantity: "",
    pricePerKg: "",
  });

  const {
    data: suppliers = [],
    isLoading: suppliersLoading,
    isError: suppliersError,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  // 🔹 Cargar datos en modo edición
  useEffect(() => {
    if (mode === "edit" && batch) {
      setFormValues({
        supplierId: batch.supplierId,
        date: new Date(`${batch.date}T00:00:00`),
        realWeight: String(batch.realWeight),
        declaredWeight: String(batch.declaredWeight),
        chickenQuantity: String(batch.chickenQuantity),
        pricePerKg: String(batch.pricePerKg),
      });
    }
  }, [batch, mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: name === "supplierId" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  return (
    <>
      <Modal show={open} size="md" onClose={onClose} popup>
        <ModalHeader />
        <ModalBody>
          <h2 className="mb-4 text-center text-2xl font-semibold text-white">
            {mode === "edit" ? "Editar remesa" : "Nueva remesa"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Fecha */}
            <div>
              <Label>Fecha</Label>
              <Datepicker
                language="es-MX"
                value={formValues.date}
                onChange={(date) =>
                  setFormValues((prev) => ({ ...prev, date }))
                }
              />
            </div>

            {/* Proveedor */}
            <div>
              <Label>Proveedor</Label>
              <Select
                name="supplierId"
                required
                disabled={suppliersLoading || suppliersError}
                value={formValues.supplierId ?? ""}
                onChange={handleChange}
              >
                <option value="" disabled>
                  {suppliersLoading
                    ? "Cargando proveedores..."
                    : suppliersError
                      ? "Error al cargar proveedores"
                      : "Selecciona un proveedor"}
                </option>

                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Pollos recibidos</Label>
              <TextInput
                name="chickenQuantity"
                type="number"
                min="0"
                required
                value={formValues.chickenQuantity}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Peso declarado (kg)</Label>
              <TextInput
                name="declaredWeight"
                type="number"
                step="any"
                min="0"
                required
                value={formValues.declaredWeight}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Peso real (kg)</Label>
              <TextInput
                name="realWeight"
                type="number"
                step="any"
                min="0"
                required
                value={formValues.realWeight}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Precio por kilo</Label>
              <TextInput
                name="pricePerKg"
                type="number"
                step="any"
                min="0"
                required
                value={formValues.pricePerKg}
                onChange={handleChange}
              />
            </div>

            <Button type="submit">
              {mode === "edit" ? "Guardar cambios" : "Guardar"}
            </Button>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}
