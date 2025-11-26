import { useEffect, useState } from "react";
import {
  Label,
  Select,
  TextInput,
  Button,
  Datepicker,
  Toast,
  ToastToggle,
} from "flowbite-react";
import {
  Branch,
  createBatch,
  fetchBranches,
  type BatchRequest,
} from "../services/api";
import { HiCheck, HiX } from "react-icons/hi";

export default function BatchEntryForm() {
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

  // 🔹 Cargar sucursales desde la API
  useEffect(() => {
    fetchBranches().then((data) =>
      setBranches(Array.isArray(data) ? data : []),
    );
  }, []);

  //   🔹 Manejar cambios en inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "branch" ? Number(value) : value,
    }));
  };
  useEffect(() => {});

  //   🔹 Enviar formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verificar si algún campo está vacío
    if (
      !formData.branchId ||
      !formData.provider?.trim() ||
      formData.chickenQuantity === undefined ||
      formData.kgTotal === undefined ||
      formData.pricePerKg === undefined ||
      !formData.date
    ) {
      alert("Por favor, completa todos los campos antes de guardar.");
      return;
    }

    const batchRequest = {
      branchId: formData.branchId,
      provider: formData.provider.trim(),
      date: formData.date,
      chickenQuantity: formData.chickenQuantity,
      kgTotal: formData.kgTotal,
      pricePerKg: formData.pricePerKg,
    };

    try {
      await createBatch(batchRequest); // asumimos que es async
      setToastMessage("Lote guardado correctamente.");
      setToastType("success");

      // Limpiar formulario
      setFormData({
        branchId: "",
        provider: "",
        chickenQuantity: "",
        kgTotal: "",
        pricePerKg: "",
        date: new Date(),
      });
    } catch {
      setToastMessage("Ocurrió un error al guardar el lote.");
      setToastType("failure");
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <h2 className="mb-4 text-center text-2xl font-semibold text-white">
          Registro de Remesa
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Sucursal */}
          <div>
            <Label htmlFor="branchId"> Sucursal</Label>
            <Select
              id="branchId"
              name="branchId"
              onChange={handleChange}
              required
              value={formData.branchId}
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
              id="date"
              name="date"
              value={formData.date}
              onChange={(date: Date | null) =>
                setFormData({ ...formData, date })
              }
            />
          </div>

          {/* Proveedor */}
          <div>
            <Label htmlFor="provider">Proveedor</Label>
            <TextInput
              id="provider"
              name="provider"
              type="text"
              required
              value={formData.provider}
              onChange={handleChange}
              placeholder="Nombre del proveedor"
            />
          </div>

          {/* Pollos recibidos */}
          <div>
            <Label htmlFor="chickenQuantity"> Pollos recibidos </Label>
            <TextInput
              id="chickenQuantity"
              name="chickenQuantity"
              type="number"
              required
              onChange={handleChange}
              value={formData.chickenQuantity}
              placeholder="Ej. 50"
              min="0"
            />
          </div>

          {/* Total de kilos */}
          <div>
            <Label htmlFor="kgTotal">Total de kilos recibidos</Label>
            <TextInput
              id="kgTotal"
              name="kgTotal"
              type="number"
              step="any"
              required
              onChange={handleChange}
              value={formData.kgTotal}
              placeholder="Ej. 150.75"
              min="0"
            />
          </div>

          {/* Precio por kilo */}
          <div>
            <Label htmlFor="pricePerKg">Precio por kilo</Label>
            <TextInput
              id="pricePerKg"
              name="pricePerKg"
              type="number"
              step="any"
              required
              onChange={handleChange}
              value={formData.pricePerKg}
              placeholder="Ej. 38.50"
              min="0"
            />
          </div>

          <Button type="submit" className="from-green-400 to-blue-600">
            Guardar
          </Button>
        </form>
      </div>
      {/* Toast */}
      {toastMessage && (
        <Toast className="fixed bottom-4 left-1/2 mt-4 -translate-x-1/2 transform">
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
    </div>
  );
}
