import { useEffect, useMemo, useState } from "react";
import { Badge, Button, TextInput } from "flowbite-react";
import { HiCheck, HiCash } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { accountLabel, formatDate } from "../utils/cashFlow.utils";
import type {
  ConfirmTripSettlementItemDTO,
  TripSettlement,
  TripSettlementStatus,
} from "../types/eggCashFlow.types";

interface Props {
  settlements: TripSettlement[];
  onConfirm: (items: ConfirmTripSettlementItemDTO[]) => void;
  isConfirming: boolean;
  accountHolder?: string;
}

const STATUS_LABELS: Record<TripSettlementStatus, string> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  CONFIRMED: "Confirmado",
  CLOSED: "Semana cerrada",
};

const STATUS_COLORS: Record<
  TripSettlementStatus,
  "warning" | "info" | "success" | "gray"
> = {
  PENDING: "warning",
  PARTIAL: "info",
  CONFIRMED: "success",
  CLOSED: "gray",
};

const officeValue = (
  values: Record<number, string>,
  settlement: TripSettlement,
) => values[settlement.tripId] ?? String(settlement.officeAmount ?? 0);

const parsedOffice = (
  values: Record<number, string>,
  settlement: TripSettlement,
) => {
  const value = Number(officeValue(values, settlement));
  return Number.isFinite(value) ? value : 0;
};

export default function TripSettlementsPanel({
  settlements,
  onConfirm,
  isConfirming,
  accountHolder,
}: Props) {
  const [officeValues, setOfficeValues] = useState<Record<number, string>>({});

  useEffect(() => {
    const next: Record<number, string> = {};
    for (const settlement of settlements) {
      next[settlement.tripId] = String(settlement.officeAmount ?? 0);
    }
    setOfficeValues(next);
  }, [settlements]);

  const confirmable = useMemo(
    () =>
      settlements.filter((settlement) => {
        if (!settlement.editable) return false;
        const office = parsedOffice(officeValues, settlement);
        const valid = office >= 0 && office <= settlement.total;
        const dirty = office !== settlement.officeAmount;
        return valid && (settlement.status !== "CONFIRMED" || dirty);
      }),
    [settlements, officeValues],
  );

  if (settlements.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
        <h3 className="text-base font-semibold text-white">Cobranza de ruta</h3>
        <p className="mt-1 text-sm text-slate-400">
          No hay cobranza en efectivo pendiente en este periodo.
        </p>
      </section>
    );
  }

  const confirmAll = () => {
    onConfirm(
      confirmable.map((settlement) => ({
        tripId: settlement.tripId,
        officeAmount: parsedOffice(officeValues, settlement),
      })),
    );
  };

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Cobranza de ruta
          </h3>
          <p className="text-sm text-slate-400">
            Se calcula con las ventas en efectivo del despacho. Confirma lo que
            se depositó en {accountLabel(accountHolder)} y ajusta lo que se
            quedó en oficina.
          </p>
        </div>
        {confirmable.length > 0 && (
          <Button
            size="sm"
            color="success"
            disabled={isConfirming}
            onClick={confirmAll}
          >
            <HiCheck className="mr-2 h-4 w-4" />
            {isConfirming
              ? "Confirmando..."
              : `Confirmar todos (${confirmable.length})`}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {settlements.map((settlement) => {
          const office = parsedOffice(officeValues, settlement);
          const bank = Math.max(settlement.total - office, 0);
          const invalid =
            !Number.isFinite(office) || office < 0 || office > settlement.total;
          const disabled = !settlement.editable || isConfirming;
          const label = `${formatDate(settlement.departureDate)} · ${
            settlement.driverName ?? "Sin chofer"
          }`;
          const dirty = office !== settlement.officeAmount;
          const showConfirm =
            settlement.editable && (settlement.status !== "CONFIRMED" || dirty);

          return (
            <div
              key={settlement.tripId}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {label}
                    </span>
                    <Badge color={STATUS_COLORS[settlement.status]}>
                      {STATUS_LABELS[settlement.status]}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {settlement.routeName ?? "Sin ruta"} · Total cobrado:{" "}
                    {formatMXN(settlement.total)}
                    {settlement.pending > 0 && settlement.status === "PARTIAL"
                      ? ` · Falta registrar: ${formatMXN(settlement.pending)}`
                      : ""}
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label
                      className="mb-1 block text-xs text-slate-400"
                      htmlFor={`office-${settlement.tripId}`}
                    >
                      Se quedó en oficina
                    </label>
                    <div className="flex items-center gap-2">
                      <TextInput
                        id={`office-${settlement.tripId}`}
                        type="number"
                        step="0.01"
                        min="0"
                        max={settlement.total}
                        sizing="sm"
                        value={officeValue(officeValues, settlement)}
                        disabled={disabled}
                        onChange={(event) =>
                          setOfficeValues((current) => ({
                            ...current,
                            [settlement.tripId]: event.target.value,
                          }))
                        }
                      />
                      <Button
                        size="xs"
                        color="light"
                        disabled={disabled}
                        onClick={() =>
                          setOfficeValues((current) => ({
                            ...current,
                            [settlement.tripId]: String(settlement.total),
                          }))
                        }
                      >
                        Todo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-slate-400">
                      A la cuenta
                    </div>
                    <div className="font-mono text-sm font-semibold text-emerald-400">
                      {formatMXN(bank)}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    color={showConfirm ? "success" : "light"}
                    disabled={disabled || invalid || !showConfirm}
                    onClick={() =>
                      onConfirm([
                        {
                          tripId: settlement.tripId,
                          officeAmount: office,
                        },
                      ])
                    }
                  >
                    <HiCash className="mr-1 h-4 w-4" />
                    {settlement.status === "CONFIRMED"
                      ? "Ajustar"
                      : "Confirmar"}
                  </Button>
                </div>
              </div>
              {settlement.weekClosed && (
                <p className="mt-2 text-xs text-slate-500">
                  La semana ya está cerrada. Reabre el último corte para
                  corregir esta cobranza.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
