import { useEffect, useRef, useState } from "react";
import {
  Button,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  TextInput,
} from "flowbite-react";
import { toLocalDateString } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDate } from "../utils/cashFlow.utils";
import type {
  CollectionSuggestion,
  TripSuggestion,
} from "../types/eggCashFlow.types";

interface Props {
  open: boolean;
  onClose: () => void;
  trips: TripSuggestion[];
  collections: CollectionSuggestion[];
  initialTripId?: number | null;
  initialPaymentId?: number | null;
  onSave: (payload: {
    date: string;
    amount: number;
    tripId?: number | null;
    paymentId?: number | null;
    description?: string | null;
    folio?: string | null;
    note?: string | null;
  }) => void;
  isSaving: boolean;
}

export default function IncomeModal({
  open,
  onClose,
  trips,
  collections,
  initialTripId,
  initialPaymentId,
  onSave,
  isSaving,
}: Props) {
  const [source, setSource] = useState<"trip" | "payment" | "other">("trip");
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [tripId, setTripId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [description, setDescription] = useState("");
  const [folio, setFolio] = useState("");
  const [note, setNote] = useState("");
  const appliedPrefill = useRef("");

  useEffect(() => {
    if (!open) return;
    appliedPrefill.current = "";
    setSource("trip");
    setDate(new Date());
    setAmount("");
    setTripId("");
    setPaymentId("");
    setDescription("");
    setFolio("");
    setNote("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (initialTripId == null && initialPaymentId == null) return;
    const key = `${initialTripId ?? ""}/${initialPaymentId ?? ""}`;
    if (appliedPrefill.current === key) return;

    if (initialTripId != null) {
      const trip = trips.find((t) => t.tripId === initialTripId);
      if (!trip) return;
      setSource("trip");
      setTripId(String(initialTripId));
      setAmount(String(trip.pending));
      setDescription(
        `Despacho ${formatDate(trip.departureDate)} - ${trip.driverName ?? ""}`,
      );
      appliedPrefill.current = key;
    } else if (initialPaymentId != null) {
      const col = collections.find((c) => c.paymentId === initialPaymentId);
      if (!col) return;
      setSource("payment");
      setPaymentId(String(initialPaymentId));
      setAmount(String(col.pending));
      setDescription(`Cobro ${col.payerName ?? ""}`);
      appliedPrefill.current = key;
    }
  }, [open, initialTripId, initialPaymentId, trips, collections]);

  const pendingTrips = trips.filter((t) => t.pending !== 0);
  const pendingCollections = collections.filter((c) => c.pending > 0);

  const handleTripChange = (value: string) => {
    setTripId(value);
    const trip = trips.find((t) => String(t.tripId) === value);
    if (trip) {
      setAmount(String(trip.pending));
      setDescription(
        `Despacho ${formatDate(trip.departureDate)} - ${trip.driverName ?? ""}`,
      );
    }
  };

  const handlePaymentChange = (value: string) => {
    setPaymentId(value);
    const col = collections.find((c) => String(c.paymentId) === value);
    if (col) {
      setAmount(String(col.pending));
      setDescription(`Cobro ${col.payerName ?? ""}`);
    }
  };

  const canSave = Boolean(amount && parseFloat(amount) > 0);

  const handleSave = () => {
    onSave({
      date: toLocalDateString(date),
      amount: parseFloat(amount) || 0,
      tripId: source === "trip" && tripId ? Number(tripId) : null,
      paymentId: source === "payment" && paymentId ? Number(paymentId) : null,
      description: description.trim() || null,
      folio: folio.trim() || null,
      note: note.trim() || null,
    });
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Nuevo ingreso · Caja chica</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label>Origen</Label>
            <Select
              value={source}
              onChange={(e) =>
                setSource(e.target.value as "trip" | "payment" | "other")
              }
            >
              <option value="trip">Despacho (ruta)</option>
              <option value="payment">Cobro (cliente/sucursal)</option>
              <option value="other">Otro</option>
            </Select>
          </div>

          {source === "trip" && (
            <div>
              <Label>Despacho</Label>
              <Select
                value={tripId}
                onChange={(e) => handleTripChange(e.target.value)}
              >
                <option value="">Seleccionar despacho...</option>
                {pendingTrips.map((t) => (
                  <option key={t.tripId} value={t.tripId}>
                    {formatDate(t.departureDate)} —{" "}
                    {t.driverName ?? "Sin chofer"} ({formatMXN(t.pending)}{" "}
                    pendiente)
                  </option>
                ))}
              </Select>
            </div>
          )}

          {source === "payment" && (
            <div>
              <Label>Cobro</Label>
              <Select
                value={paymentId}
                onChange={(e) => handlePaymentChange(e.target.value)}
              >
                <option value="">Seleccionar cobro...</option>
                {pendingCollections.map((c) => (
                  <option key={c.paymentId} value={c.paymentId}>
                    {formatDate(c.paymentDate)} — {c.payerName ?? "Sin nombre"}{" "}
                    ({formatMXN(c.pending)} pendiente)
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Label>Fecha</Label>
            <Datepicker
              language="es-MX"
              value={date}
              onChange={(d) => d && setDate(d)}
            />
          </div>

          <div>
            <Label htmlFor="incomeAmount">Monto (MXN)</Label>
            <TextInput
              id="incomeAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="incomeDescription">Concepto</Label>
            <TextInput
              id="incomeDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Ruta lunes, ABONO FCP..."
            />
          </div>

          <div>
            <Label htmlFor="incomeFolio">Folio / referencia</Label>
            <TextInput
              id="incomeFolio"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="incomeNote">Nota</Label>
            <TextInput
              id="incomeNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!canSave || isSaving}>
              {isSaving ? "Guardando..." : "Registrar ingreso"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
