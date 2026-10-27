import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import { toLocalDateString } from "@/utils/date.utils";
import type { Client } from "@/core/api/types";
import type { CashFlowSettings } from "../types/eggCashFlow.types";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: CashFlowSettings | null;
  clients: Client[];
  onSave: (payload: {
    cashOpeningBalance: number;
    bankOpeningBalance: number;
    accountHolder: string;
    trackingStartDate: string;
    directDepositClientIds: number[];
  }) => void;
  isSaving: boolean;
}

export default function SettingsModal({
  open,
  onClose,
  settings,
  clients,
  onSave,
  isSaving,
}: Props) {
  const isCreate = !settings;
  const [cashOpening, setCashOpening] = useState("0");
  const [bankOpening, setBankOpening] = useState("0");
  const [accountHolder, setAccountHolder] = useState("Titular");
  const [trackingStart, setTrackingStart] = useState<Date>(new Date());
  const [directDeposit, setDirectDeposit] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      if (settings) {
        setCashOpening(String(settings.cashOpeningBalance));
        setBankOpening(String(settings.bankOpeningBalance));
        setAccountHolder(settings.accountHolder);
        setTrackingStart(new Date(settings.trackingStartDate + "T00:00:00"));
        setDirectDeposit(settings.directDepositClientIds ?? []);
      } else {
        setCashOpening("0");
        setBankOpening("0");
        setAccountHolder("Titular");
        setTrackingStart(new Date());
        setDirectDeposit([]);
      }
    }
  }, [open, settings]);

  const paymentClients = clients.filter((c) => c.accountingEntityId != null);

  const toggleDirectDeposit = (clientId: number) => {
    setDirectDeposit((current) =>
      current.includes(clientId)
        ? current.filter((id) => id !== clientId)
        : [...current, clientId],
    );
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>
        {isCreate
          ? "Configurar flujo de efectivo"
          : "Configurar flujo de efectivo"}
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label htmlFor="settingsCashOpening">
              Saldo inicial efectivo en oficina (MXN)
            </Label>
            <TextInput
              id="settingsCashOpening"
              type="number"
              step="0.01"
              value={cashOpening}
              onChange={(e) => setCashOpening(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="settingsBankOpening">
              Saldo inicial banco (MXN)
            </Label>
            <TextInput
              id="settingsBankOpening"
              type="number"
              step="0.01"
              value={bankOpening}
              onChange={(e) => setBankOpening(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="settingsAccountHolder">Titular de la cuenta</Label>
            <TextInput
              id="settingsAccountHolder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Ej: Titular de la cuenta"
            />
          </div>

          <div>
            <Label>Inicio de seguimiento</Label>
            <Datepicker
              language="es-MX"
              value={trackingStart}
              onChange={(d) => d && setTrackingStart(d)}
            />
            <p className="mt-1 text-xs text-slate-500">
              No se podrán registrar movimientos anteriores a esta fecha.
            </p>
          </div>

          <div>
            <Label>Clientes que depositan directo a la cuenta</Label>
            <p className="mb-2 text-xs text-slate-500">
              Su cobranza entra al banco; la de los demás clientes entra a
              efectivo en oficina. Las sucursales pagan directo al banco por
              defecto; si pagan al proveedor, no entra a este flujo.
            </p>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/50 p-3">
              {paymentClients.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No hay clientes con cuenta por cobrar.
                </p>
              ) : (
                paymentClients.map((client) => (
                  <label
                    key={client.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-300"
                  >
                    <Checkbox
                      checked={directDeposit.includes(client.id)}
                      onChange={() => toggleDirectDeposit(client.id)}
                    />
                    {client.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                onSave({
                  cashOpeningBalance: parseFloat(cashOpening) || 0,
                  bankOpeningBalance: parseFloat(bankOpening) || 0,
                  accountHolder: accountHolder.trim() || "Titular",
                  trackingStartDate: toLocalDateString(trackingStart),
                  directDepositClientIds: directDeposit,
                })
              }
              disabled={isSaving}
            >
              {isSaving
                ? "Guardando..."
                : isCreate
                  ? "Crear configuración"
                  : "Guardar"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
