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
import type { Client } from "@/core/api/types";
import { formatDate } from "../utils/cashFlow.utils";
import type {
  CashFlowAccount,
  CollectionSuggestion,
  TripSuggestion,
} from "../types/eggCashFlow.types";

interface Props {
  open: boolean;
  onClose: () => void;
  trips: TripSuggestion[];
  collections: CollectionSuggestion[];
  clients: Client[];
  initialTripId?: number | null;
  initialPaymentId?: number | null;
  onSave: (payload: {
    date: string;
    amount: number;
    tripId?: number | null;
    officeAmount?: number | null;
    account?: CashFlowAccount | null;
    paymentId?: number | null;
    clientId?: number | null;
    description?: string | null;
    folio?: string | null;
    note?: string | null;
  }) => void;
  isSaving: boolean;
}

type Source = "trip" | "payment" | "client" | "other";

const sourceAccount = (source: Source): CashFlowAccount =>
  source === "payment" ? "BANK" : "CASH";

export default function IncomeModal({
  open,
  onClose,
  trips,
  collections,
  clients,
  initialTripId,
  initialPaymentId,
  onSave,
  isSaving,
}: Props) {
  const [source, setSource] = useState<Source>("trip");
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [officeAmount, setOfficeAmount] = useState("0");
  const [account, setAccount] = useState<CashFlowAccount>("CASH");
  const [tripId, setTripId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [clientId, setClientId] = useState("");
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
    setOfficeAmount("0");
    setAccount("CASH");
    setTripId("");
    setPaymentId("");
    setClientId("");
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
      setOfficeAmount("0");
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
      setAccount("BANK");
      setDescription(`Cobro ${col.payerName ?? ""}`);
      appliedPrefill.current = key;
    }
  }, [open, initialTripId, initialPaymentId, trips, collections]);

  const pendingTrips = trips.filter((t) => t.pending !== 0);
  const pendingCollections = collections.filter((c) => c.pending > 0);
  const cashClients = clients.filter((c) => !c.accountingEntityId);

  const handleSourceChange = (value: string) => {
    const next = value as Source;
    setSource(next);
    setAccount(sourceAccount(next));
    if (next === "trip") {
      setOfficeAmount("0");
    }
  };

  const handleTripChange = (value: string) => {
    setTripId(value);
    const trip = trips.find((t) => String(t.tripId) === value);
    if (trip) {
      setAmount(String(trip.pending));
      setOfficeAmount("0");
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
      setAccount("BANK");
      setDescription(`Cobro ${col.payerName ?? ""}`);
    }
  };

  const handleClientChange = (value: string) => {
    setClientId(value);
    setAccount("CASH");
    const client = cashClients.find((c) => String(c.id) === value);
    if (client) {
      setDescription(`Cobro ${client.name}`);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const parsedOffice = parseFloat(officeAmount) || 0;
  const bankAmount = Math.max(parsedAmount - parsedOffice, 0);
  const officeValid =
    source !== "trip" || (parsedOffice >= 0 && parsedOffice <= parsedAmount);
  const canSave = parsedAmount > 0 && officeValid;

  const handleSave = () => {
    onSave({
      date: toLocalDateString(date),
      amount: parsedAmount,
      tripId: source === "trip" && tripId ? Number(tripId) : null,
      officeAmount: source === "trip" ? parsedOffice : null,
      account: source === "trip" ? null : account,
      paymentId: source === "payment" && paymentId ? Number(paymentId) : null,
      clientId: source === "client" && clientId ? Number(clientId) : null,
      description: description.trim() || null,
      folio: folio.trim() || null,
      note: note.trim() || null,
    });
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Nuevo ingreso</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label htmlFor="incomeSource">Origen</Label>
            <Select
              id="incomeSource"
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
            >
              <option value="trip">
                Despacho (ruta) — efectivo del chofer
              </option>
              <option value="payment">
                Cobro pendiente (registrado en Contabilidad)
              </option>
              <option value="client">Cliente (pago en efectivo)</option>
              <option value="other">Otro</option>
            </Select>
          </div>

          {source === "trip" && (
            <>
              <div>
                <Label htmlFor="incomeTrip">Despacho</Label>
                <Select
                  id="incomeTrip"
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

              <div>
                <Label htmlFor="incomeAmount">Total cobrado (MXN)</Label>
                <TextInput
                  id="incomeAmount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  El chofer deposita al banco por defecto. Si dejó efectivo en
                  la oficina, captúralo abajo.
                </p>
              </div>

              <div>
                <Label htmlFor="incomeOfficeAmount">
                  Enviado a la oficina (MXN)
                </Label>
                <TextInput
                  id="incomeOfficeAmount"
                  type="number"
                  step="0.01"
                  value={officeAmount}
                  onChange={(e) => setOfficeAmount(e.target.value)}
                />
              </div>

              <div className="rounded-lg bg-slate-700/50 px-4 py-3">
                <div className="text-xs text-slate-400">
                  Depositado al banco
                </div>
                <div className="text-lg font-bold text-white">
                  {formatMXN(bankAmount)}
                </div>
              </div>
            </>
          )}

          {source === "payment" && (
            <div>
              <Label htmlFor="incomePayment">Cobro</Label>
              <Select
                id="incomePayment"
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

          {source === "client" && (
            <div>
              <Label htmlFor="incomeClient">Cliente</Label>
              <Select
                id="incomeClient"
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
              >
                <option value="">Seleccionar cliente...</option>
                {cashClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-slate-500">
                Solo clientes sin cuenta por cobrar. Los cobros de clientes con
                cuenta se registran solos al guardarlos en Contabilidad.
              </p>
            </div>
          )}

          {source !== "trip" && (
            <>
              <div>
                <Label htmlFor="incomeDestination">Destino</Label>
                <Select
                  id="incomeDestination"
                  value={account}
                  onChange={(e) =>
                    setAccount(e.target.value as CashFlowAccount)
                  }
                >
                  <option value="BANK">Banco</option>
                  <option value="CASH">Efectivo en oficina</option>
                </Select>
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
            </>
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
