import { useEffect, useState } from "react";
import {
  Button,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import { toLocalDateString } from "@/utils/date.utils";
import type { CashFlowSettings } from "../types/eggCashFlow.types";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: CashFlowSettings | null;
  onSave: (payload: {
    cashOpeningBalance: number;
    bankOpeningBalance: number;
    accountHolder: string;
    trackingStartDate: string;
  }) => void;
  isSaving: boolean;
}

export default function SettingsModal({
  open,
  onClose,
  settings,
  onSave,
  isSaving,
}: Props) {
  const isCreate = !settings;
  const [cashOpening, setCashOpening] = useState("0");
  const [bankOpening, setBankOpening] = useState("0");
  const [accountHolder, setAccountHolder] = useState("Titular");
  const [trackingStart, setTrackingStart] = useState<Date>(new Date());

  useEffect(() => {
    if (open) {
      if (settings) {
        setCashOpening(String(settings.cashOpeningBalance));
        setBankOpening(String(settings.bankOpeningBalance));
        setAccountHolder(settings.accountHolder);
        setTrackingStart(new Date(settings.trackingStartDate + "T00:00:00"));
      } else {
        setCashOpening("0");
        setBankOpening("0");
        setAccountHolder("Titular");
        setTrackingStart(new Date());
      }
    }
  }, [open, settings]);

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
              Saldo inicial caja chica (MXN)
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
              Saldo inicial caja general (MXN)
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
