import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
  Textarea,
} from "flowbite-react";
import { toLocalDateString } from "@/utils/date.utils";
import { useSaveEggPriceReference } from "../api/routeOrders.queries";
import type { EggPriceReferenceDTO } from "../types/routeOrder.types";

interface Props {
  open: boolean;
  current: EggPriceReferenceDTO | null | undefined;
  onClose: () => void;
  onSaved: () => void;
}

export const EggPriceModal: React.FC<Props> = ({
  open,
  current,
  onClose,
  onSaved,
}) => {
  const [price, setPrice] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const saveMutation = useSaveEggPriceReference();

  useEffect(() => {
    if (!open) return;
    setPrice(current ? String(current.pricePerCarton) : "");
    setEffectiveFrom(new Date());
    setNotes("");
    setError(null);
  }, [open, current]);

  const handleSave = async () => {
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Escribe un precio mayor a cero.");
      return;
    }
    if (!effectiveFrom) {
      setError("Selecciona la fecha desde la que aplica el precio.");
      return;
    }
    setError(null);
    try {
      await saveMutation.mutateAsync({
        pricePerCarton: parsedPrice,
        effectiveFrom: toLocalDateString(effectiveFrom),
        notes: notes.trim() || null,
      });
      onSaved();
      onClose();
    } catch {
      setError("No se pudo guardar el precio. Intenta de nuevo.");
    }
  };

  return (
    <Modal show={open} size="md" onClose={onClose}>
      <ModalHeader>Actualizar precio actual del huevo</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Este precio es una referencia general. Puedes consultarlo en la hoja
            y aplicarlo a una ruta cuando lo necesites; cada cliente puede
            conservar su propio precio.
          </p>
          <div>
            <Label htmlFor="egg-price-carton">Precio por casillero</Label>
            <TextInput
              id="egg-price-carton"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            {Number(price) > 0 && (
              <p className="mt-1 text-xs text-emerald-400">
                Equivale a{" "}
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(Number(price) * 12)}{" "}
                por caja.
              </p>
            )}
          </div>
          <div>
            <Label>Vigente desde</Label>
            <Datepicker
              language="es-MX"
              labelTodayButton="Hoy"
              labelClearButton="Limpiar"
              value={effectiveFrom}
              onChange={setEffectiveFrom}
            />
          </div>
          <div>
            <Label htmlFor="egg-price-notes">Notas (opcional)</Label>
            <Textarea
              id="egg-price-notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ej. precio de la semana, ajuste por proveedor..."
            />
          </div>
          {error && <Alert color="failure">{error}</Alert>}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="gray"
          onClick={onClose}
          disabled={saveMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          color="warning"
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Guardando..." : "Guardar precio"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
