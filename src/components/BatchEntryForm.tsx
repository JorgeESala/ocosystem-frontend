import { useEffect, useState } from "react";
import {
  Label,
  Select,
  TextInput,
  Button,
  Datepicker,
  Toast,
  ToastToggle,
  Modal,
  ModalHeader,
  ModalBody,
} from "flowbite-react";
import {
  Branch,
  createBatch,
  updateBatch,
  fetchBranches,
  type Batch,
  type BatchRequest,
} from "../services/api";
import { HiCheck, HiX } from "react-icons/hi";
import { useBranchSuppliers } from "@/features/branches/branchsupplier/branch.supplier.queries";

export default function BatchEntryForm({
  open,
  onClose,
  onSuccess,
  batch,
  mode = "create",
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  batch?: Batch;
  mode?: "create" | "edit";
}) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState<BatchRequest>({
    branchId: "",
    supplierId: "",
    date: new Date(),
    provider: "",
    chickenQuantity: "",
    kgTotal: "",
    pricePerKg: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "failure">("success");
  const { data: branchSuppliers = [], isLoading: loadingSuppliers } =
    useBranchSuppliers();
  useEffect(() => {
    if (
      !loadingSuppliers &&
      branchSuppliers.length > 0 &&
      !formData.supplierId
    ) {
      setFormData((prev) => ({ ...prev, supplierId: "1" }));
    }
  }, [branchSuppliers, loadingSuppliers]);

  // Cargar sucursales
  useEffect(() => {
    if (!open) return;
    fetchBranches().then((data) =>
      setBranches(Array.isArray(data) ? data : []),
    );
  }, [open]);

  // Cargar datos si estoy editando
  useEffect(() => {
    if (mode === "edit" && batch) {
      setFormData({
        branchId: batch.branchId,
        supplierId: batch.supplierId,
        provider: batch.provider,
        chickenQuantity: String(batch.chickenQuantity),
        kgTotal: String(batch.kgTotal),
        pricePerKg: String(batch.pricePerKg),
        date: new Date(`${batch.date}T00:00:00`),
      });
    }
  }, [batch, mode]);

  // Manejo inputs
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    const numericFields = [
      "branchId",
      "chickenQuantity",
      "kgTotal",
      "pricePerKg",
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  // Guardar
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      if (mode === "edit" && batch) {
        await updateBatch(batch.id, {
          branchId: Number(formData.branchId),
          provider: formData.provider.trim(),
          date: formData.date,
          chickenQuantity: Number(formData.chickenQuantity),
          kgTotal: Number(formData.kgTotal),
          pricePerKg: Number(formData.pricePerKg),
        });

        setToastMessage("Remesa actualizada.");
      } else {
        await createBatch({
          branchId: formData.branchId,
          supplierId: Number(formData.supplierId),
          provider: formData.provider.trim(),
          date: formData.date,
          chickenQuantity: formData.chickenQuantity,
          kgTotal: formData.kgTotal,
          pricePerKg: formData.pricePerKg,
        });
        setToastMessage("Remesa creada.");
      }

      setToastType("success");

      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        setToastMessage(null);
      }, 500);
    } catch (err) {
      setToastMessage("Error al guardar la remesa.");
      setToastType("failure");
    }
  };

  return (
    <>
      <Modal show={open} size="md" onClose={onClose} popup>
        <ModalHeader />
        <ModalBody>
          <h2 className="mb-4 text-center text-2xl font-semibold text-white">
            {mode === "edit" ? "Editar Remesa" : "Nueva Remesa"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Sucursal */}
            <div>
              <Label>Sucursal</Label>
              <Select
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una sucursal</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Cedis */}
            <div>
              <Label>Cedis</Label>
              <Select
                name="supplierId"
                value={formData.supplierId || "1"}
                onChange={handleChange}
                required
                disabled={loadingSuppliers || branchSuppliers.length === 0}
              >
                {loadingSuppliers ? (
                  <option value="">Cargando opciones...</option>
                ) : (
                  <option value="">Selecciona un cedis</option>
                )}

                {branchSuppliers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Fecha */}
            <div>
              <Label>Fecha</Label>
              <Datepicker
                language="es-MX"
                value={formData.date}
                onChange={(date: Date | null) =>
                  setFormData({ ...formData, date })
                }
              />
            </div>

            <div>
              <Label>Proveedor</Label>
              <TextInput
                name="provider"
                type="text"
                required
                value={formData.provider}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Pollos recibidos</Label>
              <TextInput
                name="chickenQuantity"
                type="number"
                min="0"
                required
                value={formData.chickenQuantity}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Total de kilos recibidos</Label>
              <TextInput
                name="kgTotal"
                type="number"
                step="any"
                min="0"
                required
                value={formData.kgTotal}
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
                value={formData.pricePerKg}
                onChange={handleChange}
              />
            </div>

            <Button type="submit">
              {mode === "edit" ? "Guardar cambios" : "Guardar"}
            </Button>
          </form>
        </ModalBody>
      </Modal>

      {toastMessage && (
        <Toast className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
          <div
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              toastType === "success"
                ? "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200"
                : "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200"
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
    </>
  );
}
