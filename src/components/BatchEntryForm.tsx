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
  fetchBranches,
  type BatchRequest,
} from "../services/api";
import { HiCheck, HiX } from "react-icons/hi";

export default function BatchEntryForm({
  open,
  onClose,
  onSuccess, // para invalidar el query afuera
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState<BatchRequest>({
    branchId: "",
    date: new Date(),
    provider: "",
    chickenQuantity: "",
    kgTotal: "",
    pricePerKg: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "failure">("success");

  // Cargar sucursales
  useEffect(() => {
    if (!open) return;
    fetchBranches().then((data) =>
      setBranches(Array.isArray(data) ? data : []),
    );
  }, [open]);

  // Manejo de inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "branchId" ? Number(value) : value,
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await createBatch({
        branchId: formData.branchId,
        provider: formData.provider.trim(),
        date: formData.date,
        chickenQuantity: formData.chickenQuantity,
        kgTotal: formData.kgTotal,
        pricePerKg: formData.pricePerKg,
      });

      setToastMessage("Remesa guardada correctamente.");
      setToastType("success");

      // invalidar query en componente padre
      if (onSuccess) onSuccess();

      // limpiar
      setFormData({
        branchId: "",
        provider: "",
        chickenQuantity: "",
        kgTotal: "",
        pricePerKg: "",
        date: new Date(),
      });

      // Cerrar modal después de guardado
      setTimeout(() => {
        onClose();
        setToastMessage(null);
      }, 600);
    } catch (err) {
      setToastMessage("Ocurrió un error al guardar la remesa.");
      setToastType("failure");
    }
  };

  return (
    <>
      <Modal show={open} size="md" onClose={onClose} popup>
        <ModalHeader />
        <ModalBody>
          <h2 className="mb-4 text-center text-2xl font-semibold text-white">
            Registro de Remesa
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

            {/* Proveedor */}
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

            {/* Pollos */}
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

            {/* Kilos */}
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

            {/* Precio */}
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

            <Button type="submit">Guardar</Button>
          </form>
        </ModalBody>
      </Modal>

      {/* Toast */}
      {toastMessage && (
        <Toast className="fixed bottom-4 left-1/2 z-50 mt-4 -translate-x-1/2 transform">
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
