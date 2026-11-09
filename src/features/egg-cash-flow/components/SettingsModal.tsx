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
import {
  accountLabel,
  DEFAULT_WEEKLY_CASH_TARGET,
} from "../utils/cashFlow.utils";

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
    weeklyCashTarget: number;
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
  const [weeklyCashTarget, setWeeklyCashTarget] = useState(
    String(DEFAULT_WEEKLY_CASH_TARGET),
  );
  const [directDeposit, setDirectDeposit] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      if (settings) {
        setCashOpening(String(settings.cashOpeningBalance));
        setBankOpening(String(settings.bankOpeningBalance));
        setAccountHolder(settings.accountHolder);
        setTrackingStart(new Date(settings.trackingStartDate + "T00:00:00"));
        setWeeklyCashTarget(
          String(settings.weeklyCashTarget ?? DEFAULT_WEEKLY_CASH_TARGET),
        );
        setDirectDeposit(settings.directDepositClientIds ?? []);
      } else {
        setCashOpening("0");
        setBankOpening("0");
        setAccountHolder("Titular");
        setTrackingStart(new Date());
        setWeeklyCashTarget(String(DEFAULT_WEEKLY_CASH_TARGET));
        setDirectDeposit([]);
      }
    }
  }, [open, settings]);

  const paymentClients = clients.filter((c) => c.accountingEntityId != null);
  const parsedWeeklyCashTarget = Number(weeklyCashTarget);
  const weeklyCashTargetValid =
    weeklyCashTarget.trim() !== "" &&
    Number.isFinite(parsedWeeklyCashTarget) &&
    parsedWeeklyCashTarget > 0;

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
              Saldo inicial de {accountLabel(accountHolder)} (MXN)
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
              placeholder="Ej: Enrique"
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
            <Label htmlFor="settingsWeeklyCashTarget">
              Efectivo objetivo en oficina cada viernes (MXN)
            </Label>
            <TextInput
              id="settingsWeeklyCashTarget"
              type="number"
              step="0.01"
              min="0"
              value={weeklyCashTarget}
              aria-invalid={!weeklyCashTargetValid}
              onChange={(e) => setWeeklyCashTarget(e.target.value)}
            />
            {!weeklyCashTargetValid && (
              <p className="mt-1 text-xs text-red-400">
                Captura un efectivo objetivo mayor que cero.
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Después del cierre de viernes, la oficina debe quedar con este
              efectivo. Si ya había sobrante, solo se retiene la diferencia; si
              sobra más, se deposita a la cuenta.
            </p>
          </div>

          <div>
            <Label>
              Clientes con cuenta que normalmente depositan en{" "}
              {accountLabel(accountHolder)}
            </Label>
            <p className="mb-2 text-xs text-slate-500">
              Marca a los clientes que normalmente depositan en{" "}
              {accountLabel(accountHolder)}. El destino real depende de la forma
              de pago: efectivo entra a efectivo en oficina; transferencia,
              depósito, cheque o SPEI entran a {accountLabel(accountHolder)}. La
              marca solo define el comportamiento por defecto cuando la forma de
              pago es “Otro”. Las sucursales pagan directo a{" "}
              {accountLabel(accountHolder)} por defecto; si pagan al proveedor,
              no entra a este flujo.
            </p>
            <p className="mb-2 text-xs text-slate-500">
              El efectivo en oficina se calcula automáticamente. El saldo real
              se captura al cerrar la semana.
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
                  weeklyCashTarget: parsedWeeklyCashTarget,
                  directDepositClientIds: directDeposit,
                })
              }
              disabled={isSaving || !weeklyCashTargetValid}
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
