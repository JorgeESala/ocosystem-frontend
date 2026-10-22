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
import { formatMXN } from "@/utils/moneyNumbers";

interface Props {
  open: boolean;
  onClose: () => void;
  weekStart: Date;
  weekEnd: Date;
  summary: {
    cashClosingBalance: number;
    bankClosingBalance: number;
    remesaDebtTotal: number;
  } | null;
  onSave: (payload: {
    weekStart: string;
    weekEnd: string;
    realBankBalance?: number | null;
    realCashBalance?: number | null;
    note?: string | null;
  }) => void;
  isSaving: boolean;
}

export default function CutModal({
  open,
  onClose,
  weekStart,
  weekEnd,
  summary,
  onSave,
  isSaving,
}: Props) {
  const [start, setStart] = useState<Date>(weekStart);
  const [end, setEnd] = useState<Date>(weekEnd);
  const [realBankBalance, setRealBankBalance] = useState("");
  const [realCashBalance, setRealCashBalance] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setStart(weekStart);
      setEnd(weekEnd);
      setRealBankBalance("");
      setRealCashBalance("");
      setNote("");
    }
  }, [open, weekStart, weekEnd]);

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>Corte de semana</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {summary && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-700/50 px-4 py-3">
                <div className="text-xs text-slate-400">
                  Cierre caja chica (esperado)
                </div>
                <div className="text-lg font-bold text-white">
                  {formatMXN(summary.cashClosingBalance)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-700/50 px-4 py-3">
                <div className="text-xs text-slate-400">
                  Cierre banco (esperado)
                </div>
                <div className="text-lg font-bold text-white">
                  {formatMXN(summary.bankClosingBalance)}
                </div>
              </div>
            </div>
          )}

          <div>
            <Label>Inicio de semana</Label>
            <Datepicker
              language="es-MX"
              value={start}
              onChange={(d) => d && setStart(d)}
            />
          </div>

          <div>
            <Label>Fin de semana</Label>
            <Datepicker
              language="es-MX"
              value={end}
              onChange={(d) => d && setEnd(d)}
            />
          </div>

          <div>
            <Label htmlFor="cutRealBank">Saldo real en cuenta (opcional)</Label>
            <TextInput
              id="cutRealBank"
              type="number"
              step="0.01"
              value={realBankBalance}
              onChange={(e) => setRealBankBalance(e.target.value)}
              placeholder="Lo que muestra el banco real"
            />
          </div>

          <div>
            <Label htmlFor="cutRealCash">
              Efectivo real en oficina (opcional)
            </Label>
            <TextInput
              id="cutRealCash"
              type="number"
              step="0.01"
              value={realCashBalance}
              onChange={(e) => setRealCashBalance(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="cutNote">Nota</Label>
            <TextInput
              id="cutNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-amber-900/20 px-4 py-3 text-xs text-amber-300">
            Al cerrar la semana, no se podrán registrar movimientos en ese rango
            de fechas.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              color="yellow"
              onClick={() =>
                onSave({
                  weekStart: toLocalDateString(start),
                  weekEnd: toLocalDateString(end),
                  realBankBalance: realBankBalance
                    ? parseFloat(realBankBalance)
                    : null,
                  realCashBalance: realCashBalance
                    ? parseFloat(realCashBalance)
                    : null,
                  note: note.trim() || null,
                })
              }
              disabled={isSaving}
            >
              {isSaving ? "Cerrando..." : "Cerrar semana"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
