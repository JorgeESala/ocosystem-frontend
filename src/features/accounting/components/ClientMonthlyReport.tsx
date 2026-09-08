import { Badge, Button, Spinner } from "flowbite-react";
import { useMemo } from "react";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDateToISO, formatHumanDate } from "@/utils/date.utils";
import DateRangePicker from "@/components/DateRangePicker";
import { useClientStatementSummary } from "../api/client-summary.queries";
import type { ClientMonthlyReportPdfInput } from "../api/client-summary.api";
import { InfoTip } from "./InfoTip";
import {
  CargosHelpContent,
  PagosHelpContent,
  SaldoFinalHelpContent,
  SaldoInicialHelpContent,
} from "./AccountingHelpContent";
import { AccountingErrorAlert } from "./AccountingErrorAlert";
import { statementRowLabel } from "../utils/openAccounts";

interface Props {
  debtorEntityId: number;
  debtorName: string;
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
  creditorNames: Map<number, string>;
  onExportPdf?: (input: ClientMonthlyReportPdfInput) => void;
}

const toDate = (iso: string): Date | null => {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const monthBounds = (offset: number): { from: string; to: string } => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { from: formatDateToISO(first), to: formatDateToISO(last) };
};

export const ClientMonthlyReport = ({
  debtorEntityId,
  debtorName,
  from,
  to,
  onRangeChange,
  creditorNames,
  onExportPdf,
}: Props) => {
  const start = useMemo(() => toDate(from), [from]);
  const end = useMemo(() => toDate(to), [to]);
  const validRange = start != null && end != null && start <= end;

  const { data, isLoading, isError, error, refetch } =
    useClientStatementSummary({
      debtorEntityId,
      from,
      to,
      enabled: validRange,
    });

  const handlePickerChange = (nextStart: Date | null, nextEnd: Date | null) => {
    if (nextStart && nextEnd) {
      onRangeChange(formatDateToISO(nextStart), formatDateToISO(nextEnd));
    }
  };

  const applyPreset = (offset: number) => {
    const bounds = monthBounds(offset);
    onRangeChange(bounds.from, bounds.to);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-2">
          <DateRangePicker
            key={`${from}-${to}`}
            startDate={start}
            endDate={end}
            onChange={handlePickerChange}
          />
          <div className="flex gap-2">
            <Button size="xs" color="gray" onClick={() => applyPreset(0)}>
              Este mes
            </Button>
            <Button size="xs" color="gray" onClick={() => applyPreset(-1)}>
              Mes pasado
            </Button>
          </div>
          {start && end && (
            <p className="text-xs text-gray-400">
              Del {formatHumanDate(from, "short")} al{" "}
              {formatHumanDate(to, "short")}
            </p>
          )}
        </div>
        {data && onExportPdf && (
          <Button
            size="xs"
            color="gray"
            onClick={() =>
              onExportPdf({
                debtorName,
                from: data.from,
                to: data.to,
                openingBalance: data.openingBalance,
                totalCharges: data.totalCharges,
                totalPayments: data.totalPayments,
                closingBalance: data.closingBalance,
                movements: data.movements.map((m) => ({
                  movementDate: m.movementDate,
                  creditorName:
                    creditorNames.get(m.creditorEntityId) ??
                    `Entidad ${m.creditorEntityId}`,
                  movementType: m.movementType,
                  amount: m.amount,
                  balanceAfter: m.balanceAfter,
                  folio: m.folio,
                  note: m.note,
                })),
              })
            }
          >
            Exportar PDF
          </Button>
        )}
      </div>

      {!validRange ? (
        <p className="text-sm text-yellow-300">
          Elige una fecha de inicio anterior o igual a la fecha de fin.
        </p>
      ) : isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : isError ? (
        <AccountingErrorAlert error={error} onRetry={() => refetch()} />
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
              <p className="flex items-center gap-1 text-[10px] tracking-wider text-gray-400 uppercase">
                Saldo inicial
                <InfoTip title="Saldo inicial" align="left">
                  <SaldoInicialHelpContent />
                </InfoTip>
              </p>
              <p className="text-lg font-bold text-white">
                {formatMXN(data.openingBalance)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
              <p className="flex items-center gap-1 text-[10px] tracking-wider text-gray-400 uppercase">
                Saldo final
                <InfoTip title="Saldo final" align="right">
                  <SaldoFinalHelpContent />
                </InfoTip>
              </p>
              <p className="text-lg font-bold text-white">
                {formatMXN(data.closingBalance)}
              </p>
            </div>
            <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3">
              <p className="flex items-center gap-1 text-[10px] tracking-wider text-red-300 uppercase">
                Cargos
                <InfoTip title="Cargos" align="left">
                  <CargosHelpContent />
                </InfoTip>
              </p>
              <p className="text-lg font-bold text-white">
                {formatMXN(data.totalCharges)}
              </p>
            </div>
            <div className="rounded-lg border border-green-900/40 bg-green-950/20 p-3">
              <p className="flex items-center gap-1 text-[10px] tracking-wider text-green-300 uppercase">
                Pagos
                <InfoTip title="Pagos" align="right">
                  <PagosHelpContent />
                </InfoTip>
              </p>
              <p className="text-lg font-bold text-white">
                {formatMXN(data.totalPayments)}
              </p>
            </div>
          </div>

          {data.movements.length === 0 ? (
            <p className="text-sm text-gray-400">
              Sin movimientos para {debtorName} en el rango elegido.
            </p>
          ) : (
            <ul className="divide-y divide-gray-700">
              {[...data.movements].reverse().map((m, idx) => (
                <li
                  key={`${m.movementDate}-${m.amount}-${idx}`}
                  className="flex items-start justify-between gap-2 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge color="gray">
                        {statementRowLabel(m.movementType)}
                      </Badge>
                      <span className="text-[11px] text-gray-400">
                        {creditorNames.get(m.creditorEntityId) ??
                          `Entidad ${m.creditorEntityId}`}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatHumanDate(m.movementDate)}
                      {m.folio ? ` · ${m.folio}` : ""}
                      {m.balanceAfter != null
                        ? ` · saldo ${formatMXN(m.balanceAfter)}`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-white">
                    {formatMXN(m.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};
