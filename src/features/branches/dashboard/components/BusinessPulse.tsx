import { Button } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiCurrencyDollar, HiExclamationCircle } from "react-icons/hi";
import { InfoTip } from "@/components/InfoTip";
import { deltaPct } from "@/features/branches/reports/utils/consolidatedMetrics";
import { formatDateRange, stringToDate } from "@/utils/date.utils";
import { formatMXNCompact } from "@/utils/moneyNumbers";
import { buildScopeSearch } from "@/utils/scopeParams";
import DeltaWithValues from "./DeltaWithValues";
import type {
  BranchesDashboardCoverageDTO,
  BranchesDashboardSummaryDTO,
} from "../api/branchesDashboard.types";

export interface PulseScope {
  branchIds: number[];
  start: Date;
  end: Date;
}

export interface PulsePeriod {
  start: string;
  end: string;
  previousStart: string;
  previousEnd: string;
}

interface Props {
  summary: BranchesDashboardSummaryDTO;
  coverage: BranchesDashboardCoverageDTO;
  slug: string;
  scope: PulseScope;
  period?: PulsePeriod | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const numberLabel = (value: number) =>
  value.toLocaleString("es-MX", { maximumFractionDigits: 1 });

const PulseCard = ({
  label,
  value,
  hint,
  comparison,
  info,
  to,
}: {
  label: string;
  value: string;
  hint?: string;
  comparison?: {
    value: number | null;
    current: number;
    previous: number | null;
  };
  info?: React.ReactNode;
  to?: string;
}) => {
  const className =
    "rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4 shadow-sm";
  const content = (
    <>
      <div className="flex items-center gap-1 text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
        {label}
        {info}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {comparison !== undefined && (
        <DeltaWithValues {...comparison} className="mt-1" />
      )}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </>
  );
  return to ? (
    <Link
      to={to}
      aria-label={`${label}: ${value}`}
      className={`${className} block transition hover:border-slate-500/80 focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:outline-none`}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
};

export default function BusinessPulse({
  summary,
  coverage,
  slug,
  scope,
  period,
  isLoading = false,
  isError = false,
  onRetry,
}: Props) {
  const reportsTo = `/business/${slug}/reports?${buildScopeSearch(scope.branchIds, scope.start, scope.end)}`;
  const profitTo = `/business/${slug}/profit?${buildScopeSearch(scope.branchIds, scope.start, scope.end)}`;
  if (isError) {
    return (
      <section className="rounded-2xl border border-rose-900/60 bg-rose-950/30 p-5">
        <div className="flex items-start gap-3">
          <HiExclamationCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-100">
              No se pudo cargar el resumen del negocio.
            </p>
            <p className="mt-1 text-xs text-rose-200/80">
              Revisa la conexión o intenta de nuevo. Las secciones operativas
              siguen disponibles abajo.
            </p>
          </div>
          {onRetry && (
            <Button size="xs" color="failure" onClick={onRetry}>
              Reintentar
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
            Pulso del negocio
          </h2>
          {summary.trimmedBranches > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-200 uppercase ring-1 ring-amber-700/60">
              Comparativa ajustada
              <InfoTip
                title="Comparativa ajustada por reportes faltantes"
                align="left"
              >
                {summary.trimmedBranches}{" "}
                {summary.trimmedBranches === 1 ? "sucursal" : "sucursales"} sin
                reporte en todos los días del periodo. Su comparativa excluye
                esos días y los mismos días de la semana del periodo anterior,
                para comparar días equivalentes.
              </InfoTip>
            </span>
          )}
        </div>
        {isLoading && (
          <span className="text-xs text-slate-500">Actualizando…</span>
        )}
      </div>
      {period && (
        <p data-testid="compared-ranges" className="text-xs text-slate-500">
          {formatDateRange(
            stringToDate(period.start),
            stringToDate(period.end),
          )}{" "}
          · vs.{" "}
          {formatDateRange(
            stringToDate(period.previousStart),
            stringToDate(period.previousEnd),
          )}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <PulseCard
          label="Venta total"
          value={formatMXNCompact(summary.totalSales)}
          hint="Pollo: Entradas y ventas · Otros: reportes POS"
          to={reportsTo}
          comparison={{
            value: deltaPct(summary.totalSales, summary.previousTotalSales),
            current: summary.totalSales,
            previous: summary.previousTotalSales,
          }}
          info={
            <InfoTip title="Cómo se calcula la venta total">
              Suma de la venta de pollo registrada en Entradas y ventas más la
              venta de los demás productos de los reportes POS. Los datos
              faltantes no se cuentan como cero.
            </InfoTip>
          }
        />
        <PulseCard
          label="Venta de pollo"
          value={formatMXNCompact(summary.chickenSales)}
          hint="Entradas y ventas"
          to={profitTo}
          comparison={{
            value: deltaPct(summary.chickenSales, summary.previousChickenSales),
            current: summary.chickenSales,
            previous: summary.previousChickenSales,
          }}
        />
        <PulseCard
          label="Otros productos"
          value={formatMXNCompact(summary.otherProductsSales)}
          hint="Reportes POS"
          to={reportsTo}
          comparison={{
            value: deltaPct(
              summary.otherProductsSales,
              summary.previousOtherProductsSales,
            ),
            current: summary.otherProductsSales,
            previous: summary.previousOtherProductsSales,
          }}
        />
        <PulseCard
          label="Utilidad de pollo"
          value={formatMXNCompact(summary.chickenProfit)}
          hint="Ventas de pollo − costo de pollo − gastos"
          to={profitTo}
          info={
            <InfoTip title="Cómo se calcula la utilidad de pollo">
              Utilidad calculada solo con pollo, porque es el único producto con
              costos registrados. No representa la utilidad total del negocio.
            </InfoTip>
          }
        />
        <PulseCard
          label="Pérdida neta (merma)"
          value={numberLabel(summary.mermaLossQuantity)}
          hint="Cantidad sin tripa en reportes POS"
          to={reportsTo}
          info={
            <InfoTip
              title="Por qué la merma no muestra valor en dinero"
              align="right"
            >
              La merma se mide en cantidad y excluye la tripa. No se muestra un
              valor en dinero porque el precio que traen los reportes POS no
              representa su costo real.
            </InfoTip>
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
        <HiCurrencyDollar className="h-4 w-4 text-blue-300" />
        <span className="font-semibold text-white">
          {`${coverage.branchesWithPosReport} de ${coverage.totalBranches} sucursales con reporte`}
        </span>
        <span className="text-slate-600">|</span>
        <span>
          {`${coverage.branchesWithChickenSales} con ventas de pollo registradas`}
        </span>
        <InfoTip title="Sin reporte no es cero">
          Una sucursal sin reporte no se cuenta como venta en cero; su
          información aparece como faltante en la cola de atención.
        </InfoTip>
      </div>
    </section>
  );
}
