import type { ReactNode } from "react";
import { Spinner } from "flowbite-react";
import { HiChevronRight } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { InfoTip } from "@/components/InfoTip";
import type { PaymentsSummary } from "../api/payments-summary.api";

interface Props {
  data: PaymentsSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  onShowByClient?: () => void;
  extraTooltips?: {
    cobrado?: ReactNode;
    compensaciones?: ReactNode;
  };
}

export const PaidSummaryCard = ({
  data,
  isLoading,
  isError,
  onShowByClient,
  extraTooltips,
}: Props) => {
  const showCompensations = (data?.compensationTotal ?? 0) > 0;
  const showUnapplied = (data?.unappliedTotal ?? 0) > 0;
  const showByClient =
    onShowByClient !== undefined && (data?.payers.length ?? 0) > 0;

  return (
    <div className="rounded-lg border border-emerald-800/50 bg-emerald-900/20 p-5 shadow-sm">
      <div className="flex items-center gap-1 text-xs font-medium tracking-wider text-emerald-400 uppercase">
        Cobrado en el periodo
        <InfoTip title="Cobrado en el periodo">
          {extraTooltips?.cobrado ?? (
            <div>
              Pagos activos de clientes/sucursales al CEDIS registrados dentro
              del rango de fechas seleccionado. No incluye compensaciones (sin
              efectivo) ni pagos cancelados.
            </div>
          )}
        </InfoTip>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        {isLoading ? (
          <Spinner size="md" />
        ) : (
          <span className="text-3xl font-bold text-emerald-300">
            {isError || !data ? "—" : formatMXN(data.totalCobrado)}
          </span>
        )}
        {!isLoading && !isError && data && (
          <span className="text-sm text-gray-400">
            {data.paymentCount} pago{data.paymentCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {data && !isError && showUnapplied && (
        <p className="mt-1 text-[11px] text-gray-400">
          Anticipos sin aplicar:{" "}
          <span className="font-semibold text-amber-300">
            {formatMXN(data.unappliedTotal)}
          </span>
        </p>
      )}
      {data && !isError && showCompensations && (
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
          Compensaciones:{" "}
          <span className="font-semibold text-blue-300">
            {formatMXN(data.compensationTotal)}
          </span>
          <InfoTip title="Compensaciones" align="left">
            {extraTooltips?.compensaciones ?? (
              <div>
                Saldos liquidados mediante compensación de deudas en el periodo.
                No representan dinero recibido, por eso se muestran aparte.
              </div>
            )}
          </InfoTip>
        </div>
      )}
      {showByClient && (
        <button
          type="button"
          onClick={onShowByClient}
          className="mt-2 inline-flex items-center gap-0.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
        >
          Ver por cliente
          <HiChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
