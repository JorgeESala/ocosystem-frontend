import { Alert, Badge, Button, Select, Spinner } from "flowbite-react";
import { HiCash } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { accountLabel, formatDate } from "../utils/cashFlow.utils";
import type {
  TripSettlement,
  WeeklyClosePreview,
} from "../types/eggCashFlow.types";

interface Props {
  preview: WeeklyClosePreview | undefined;
  settlements: TripSettlement[];
  selectedTripId: number | null;
  onSelectTrip: (tripId: number | null) => void;
  onConfirm: () => void;
  isConfirming: boolean;
  isLoading: boolean;
  accountHolder?: string;
}

function Metric({
  label,
  amount,
  strong,
  color,
}: {
  label: string;
  amount: number;
  strong?: boolean;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div
        className={`mt-1 font-mono text-sm ${
          strong ? "font-semibold" : ""
        } ${color ?? (strong ? "text-white" : "text-slate-200")}`}
      >
        {formatMXN(amount)}
      </div>
    </div>
  );
}

export default function FridayCashClosePanel({
  preview,
  settlements,
  selectedTripId,
  onSelectTrip,
  onConfirm,
  isConfirming,
  isLoading,
  accountHolder,
}: Props) {
  const selectableSettlements = settlements.filter(
    (settlement) => settlement.editable && !settlement.weekClosed,
  );

  if (selectableSettlements.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
        <h3 className="text-base font-semibold text-white">
          Cierre de efectivo del viernes
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          No hay despachos editables en este periodo para conservar efectivo en
          oficina.
        </p>
      </section>
    );
  }

  const selected = settlements.find(
    (settlement) => settlement.tripId === selectedTripId,
  );

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              Cierre de efectivo del viernes
            </h3>
            {preview?.recorded && <Badge color="success">Registrado</Badge>}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Elige el despacho que conservará efectivo para la nómina y los gastos
            de la semana. Los demás despachos pendientes se confirman y su
            cobranza se deposita en {accountLabel(accountHolder)}; el efectivo
            que ya estaba en oficina se conserva. La oficina queda con el
            efectivo objetivo y el sobrante anterior también se deposita.
          </p>
        </div>
        {selected && (
          <div className="text-right">
            <div className="text-xs text-slate-400">Despacho elegido</div>
            <div className="text-sm font-medium text-white">
              {formatDate(selected.departureDate)} ·{" "}
              {selected.driverName ?? "Sin chofer"}
            </div>
            <div className="text-xs text-slate-500">
              {selected.routeName ?? "Sin ruta"} ·{" "}
              {formatMXN(selected.total)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <label
          className="mb-1 block text-xs text-slate-400"
          htmlFor="friday-retention-trip"
        >
          Despacho que conserva efectivo
        </label>
        <Select
          id="friday-retention-trip"
          value={selectedTripId ?? ""}
          onChange={(event) =>
            onSelectTrip(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
        >
          <option value="">Seleccionar despacho...</option>
          {selectableSettlements.map((settlement) => (
            <option key={settlement.tripId} value={settlement.tripId}>
              {formatDate(settlement.departureDate)} ·{" "}
              {settlement.driverName ?? "Sin chofer"} ·{" "}
              {formatMXN(settlement.total)}
            </option>
          ))}
        </Select>
      </div>

      {preview && !preview.hasPayroll && (
        <Alert color="warning" className="mt-4">
          No hay nómina registrada en este periodo. Puedes cerrar, pero revisa
          que el efectivo de oficina alcance para pagarla.
        </Alert>
      )}

      {preview && preview.shortfall > 0 && (
        <Alert color="warning" className="mt-4">
          El despacho elegido no alcanza para dejar {formatMXN(preview.targetOfficeCash)}{" "}
          en oficina. Se retendrá todo su efectivo y faltarán{" "}
          {formatMXN(preview.shortfall)}. Puedes elegir otro despacho y volver a
          calcular.
        </Alert>
      )}

      {preview?.recorded && (
        <Alert color="info" className="mt-4">
          Este viernes ya tiene un cierre registrado. Al confirmar de nuevo se
          recalcula el despacho, el depósito del sobrante y los movimientos.
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : preview ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Metric
              label="Cobranza de ruta del periodo"
              amount={preview.routeCashTotal}
            />
            <Metric
              label="Efectivo en oficina actual"
              amount={preview.currentOfficeCash}
            />
            <Metric
              label="Gastos registrados"
              amount={preview.expensesTotal}
            />
            <Metric
              label="Nómina registrada"
              amount={preview.payrollTotal}
              color={
                preview.hasPayroll ? "text-amber-400" : "text-slate-400"
              }
            />
            <Metric
              label="Efectivo objetivo en oficina"
              amount={preview.targetOfficeCash}
            />
            <Metric
              label="Se retiene del despacho"
              amount={preview.retainedAmount}
              strong
              color="text-amber-400"
            />
            <Metric
              label="Se deposita del sobrante anterior"
              amount={preview.priorExcessDeposit}
              color="text-blue-400"
            />
            <Metric
              label="Queda en oficina"
              amount={preview.projectedOfficeCash}
              strong
              color="text-emerald-400"
            />
            <Metric
              label="Falta para el objetivo"
              amount={preview.shortfall}
              color={
                preview.shortfall > 0 ? "text-red-400" : "text-slate-400"
              }
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Los gastos y la nómina se toman de lo registrado en Gastos. No se
              capturan dos veces aquí.
            </p>
            <Button
              color="success"
              disabled={!selectedTripId || isConfirming}
              onClick={onConfirm}
            >
              <HiCash className="mr-2 h-4 w-4" />
              {isConfirming
                ? "Cerrando..."
                : preview.recorded
                  ? "Recalcular cierre"
                  : "Cerrar viernes"}
            </Button>
          </div>
        </>
      ) : null}
    </section>
  );
}
