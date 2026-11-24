import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { HiCog } from "react-icons/hi";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTip } from "@/components/InfoTip";
import { formatFullDate, formatWeekdayDayMonth } from "@/utils/date.utils";
import { formatMXNCompact } from "@/utils/moneyNumbers";
import type { ExpectedSalesReportDTO } from "../api/expectedSales.api";
import {
  aggregateExpectedDaily,
  formatBirds,
  formatChickenWeight,
  formatExpectedMoneyTooltipValue,
  formatExpectedTooltipLabel,
  formatExpectedTooltipValue,
  formatKg,
  formatKgValue,
  formatMoney,
  formatPricePerKg,
  formatVariance,
  comparableExpectedMoney,
  moneyComparisonState,
  MONEY_REVIEW_TOLERANCE_PCT,
} from "../utils/expectedSales";
import { ReferenceProductModal } from "./ReferenceProductModal";

interface Props {
  data?: ExpectedSalesReportDTO;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  scopeLabel?: string;
  asOf?: Date;
  canConfigure?: boolean;
}

const SummaryItem = ({
  label,
  value,
  hint,
  info,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  hint?: string;
  info?: ReactNode;
  valueClassName?: string;
}) => (
  <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
    <p className="flex items-center gap-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
      {label}
      {info}
    </p>
    <p className={`mt-1 text-xl font-bold ${valueClassName}`}>{value}</p>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

const moneyStateClass = (state: ReturnType<typeof moneyComparisonState>) => {
  if (state === "below") return "text-red-400";
  if (state === "within") return "text-amber-400";
  if (state === "above") return "text-green-400";
  return "text-white";
};

const moneyStateHint = (state: ReturnType<typeof moneyComparisonState>) => {
  if (state === "below") return "Por debajo del mínimo";
  if (state === "within") return "Dentro de la tolerancia";
  if (state === "above") return "Por arriba del mínimo";
  return "Sin producto o precio de referencia";
};

export const ExpectedSalesSection = ({
  data,
  isLoading = false,
  isError = false,
  onRetry,
  scopeLabel,
  asOf,
  canConfigure = false,
}: Props) => {
  const [view, setView] = useState<"kg" | "money">("kg");
  const [configOpen, setConfigOpen] = useState(false);

  const dailyRows = useMemo(
    () => aggregateExpectedDaily(data?.daily ?? []),
    [data],
  );

  if (isLoading && !data) {
    return (
      <Card className="border-none bg-gray-800 shadow-xl">
        <div className="flex h-32 items-center justify-center text-sm text-gray-400">
          Cargando venta esperada...
        </div>
      </Card>
    );
  }

  if (isError && !data) {
    return (
      <Card className="border-none bg-gray-800 shadow-xl">
        <Alert color="failure">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              No se pudo cargar la venta esperada. Revisa la conexión o intenta
              de nuevo.
            </span>
            {onRetry && (
              <Button size="xs" color="failure" onClick={onRetry}>
                Reintentar
              </Button>
            )}
          </div>
        </Alert>
      </Card>
    );
  }

  const summary = data?.summary;
  const wastePerChicken = summary?.wastePerChickenKg ?? 0.25;
  const wasteGrams = Math.round(wastePerChicken * 1000);
  const hasExpected = (summary?.daysWithData ?? 0) > 0;
  const hasMultipleBranches =
    new Set((data?.daily ?? []).map((row) => row.branchId)).size > 1;
  const branchInfo =
    !hasMultipleBranches && (data?.branches ?? []).length === 1
      ? data?.branches[0]
      : null;
  const moneyView = view === "money";
  const moneyState = moneyComparisonState(
    comparableExpectedMoney(
      summary?.comparableReportedMoney,
      summary?.moneyDifference,
    ),
    summary?.comparableReportedMoney,
  );
  const effectivePrice = summary?.effectivePricePerKg;
  const closePrice = branchInfo?.referencePricePerKg;
  const priceHint = [
    effectivePrice != null
      ? `Efectivo: ${formatPricePerKg(effectivePrice)}`
      : null,
    closePrice != null ? `Cierre: ${formatPricePerKg(closePrice)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const minimumHint = branchInfo?.referenceProductName
    ? `${branchInfo.referenceProductName}${priceHint ? ` · ${priceHint}` : " · Sin precio registrado"}`
    : hasMultipleBranches
      ? "Cada sucursal usa su propio producto y precio"
      : "Configura el producto de referencia";
  const comparableDays = summary?.comparableDays ?? 0;
  const daysWithData = summary?.daysWithData ?? 0;
  const missingReportedMoney = (summary?.salesWithoutReportedMoney ?? 0) > 0;
  const differenceHint = moneyState
    ? `${moneyStateHint(moneyState)} · ${comparableDays} de ${daysWithData} días`
    : summary?.expectedMoney == null
      ? "Sin producto o precio de referencia"
      : missingReportedMoney
        ? "Sin monto registrado"
        : "Sin producto o precio de referencia";
  const reportedMoneyHint =
    summary?.reportedMoney == null && missingReportedMoney
      ? "Sin monto registrado"
      : `Comparable: ${formatMoney(
          summary?.comparableReportedMoney,
        )} · ${comparableDays} de ${daysWithData} días`;

  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="flex items-center gap-1 text-lg font-semibold text-gray-200">
            Venta esperada vs vendida
            <InfoTip title="Venta esperada vs vendida">
              Por cada venta de remesa: (peso promedio del pollo de la remesa −{" "}
              {wasteGrams} g) × pollos vendidos. Si un día hay ventas de varias
              remesas, se suman. En dinero, el mínimo es kg esperados × el
              último precio de venta de referencia de cada día. La venta total
              incluye todos los días; la diferencia usa solo los días
              comparables. Se permite {MONEY_REVIEW_TOLERANCE_PCT}% de
              tolerancia por redondeo. No es una meta ni una proyección.
            </InfoTip>
          </h3>
          {scopeLabel && (
            <span className="text-xs text-gray-500">{scopeLabel}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-gray-700 p-1">
            <Button
              size="xs"
              color={moneyView ? "gray" : "blue"}
              onClick={() => setView("kg")}
            >
              Kg
            </Button>
            <Button
              size="xs"
              color={moneyView ? "blue" : "gray"}
              onClick={() => setView("money")}
            >
              Dinero
            </Button>
          </div>
          {canConfigure && asOf && (
            <Button size="xs" color="gray" onClick={() => setConfigOpen(true)}>
              <HiCog className="mr-1 h-4 w-4" />
              Producto de referencia
            </Button>
          )}
        </div>
      </div>

      {moneyView ? (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryItem
            label="Venta mínima esperada"
            value={formatMoney(summary?.expectedMoney)}
            hint={minimumHint}
          />
          <SummaryItem
            label="Venta registrada"
            value={formatMoney(summary?.reportedMoney)}
            hint={reportedMoneyHint}
          />
          <SummaryItem
            label="Diferencia contra el mínimo"
            value={formatMoney(summary?.moneyDifference)}
            valueClassName={moneyStateClass(moneyState)}
            hint={differenceHint}
          />
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryItem
            label="Kg esperados"
            value={formatKg(summary?.expectedKg)}
            hint={`Peso promedio: ${formatChickenWeight(summary?.avgChickenWeight)}`}
          />
          <SummaryItem
            label="Kg vendidos"
            value={formatKg(summary?.reportedKg)}
            hint={`${formatBirds(summary?.birdsSold)} pollos vendidos`}
          />
          <SummaryItem
            label="Diferencia"
            value={formatKg(summary?.differenceKg)}
            hint={formatVariance(summary?.variancePct)}
          />
        </div>
      )}

      {(summary?.salesWithoutWeight ?? 0) > 0 && (
        <Alert color="warning" className="mb-4">
          {summary?.salesWithoutWeight}{" "}
          {summary?.salesWithoutWeight === 1 ? "venta" : "ventas"} sin peso
          promedio de remesa{" "}
          {summary?.salesWithoutWeight === 1
            ? "no se incluye"
            : "no se incluyen"}{" "}
          en el cálculo.
        </Alert>
      )}

      {(summary?.salesWithoutReportedKg ?? 0) > 0 && (
        <Alert color="warning" className="mb-4">
          {summary?.salesWithoutReportedKg}{" "}
          {summary?.salesWithoutReportedKg === 1 ? "venta" : "ventas"} sin kilos
          vendidos registrados{" "}
          {summary?.salesWithoutReportedKg === 1
            ? "no se incluye"
            : "no se incluyen"}{" "}
          en el cálculo.
        </Alert>
      )}

      {moneyView && (summary?.salesWithZeroMoney ?? 0) > 0 && (
        <Alert color="warning" className="mb-4">
          {summary?.salesWithZeroMoney}{" "}
          {summary?.salesWithZeroMoney === 1 ? "venta" : "ventas"} con monto
          cero; se incluyen en la venta registrada y pueden quedar por debajo
          del mínimo.
        </Alert>
      )}

      {moneyView && (summary?.salesWithoutReportedMoney ?? 0) > 0 && (
        <Alert color="warning" className="mb-4">
          {summary?.salesWithoutReportedMoney}{" "}
          {summary?.salesWithoutReportedMoney === 1 ? "venta" : "ventas"} sin
          monto registrado; su mínimo no entra en la diferencia.
        </Alert>
      )}

      {moneyView && (summary?.branchesWithoutReference ?? 0) > 0 && (
        <Alert color="warning" className="mb-4">
          {summary?.branchesWithoutReference}{" "}
          {summary?.branchesWithoutReference === 1
            ? "sucursal no tiene"
            : "sucursales no tienen"}{" "}
          producto de referencia; su venta no entra en el mínimo.
        </Alert>
      )}

      {moneyView && (summary?.daysWithoutPrice ?? 0) > 0 && (
        <Alert color="warning" className="mb-4">
          {summary?.daysWithoutPrice}{" "}
          {summary?.daysWithoutPrice === 1 ? "día sin" : "días sin"} precio de
          referencia; no se incluyen en la diferencia.
        </Alert>
      )}

      {!hasExpected ? (
        <Alert color="info">
          No hay ventas de remesa con peso promedio y kilos vendidos registrados
          en el periodo.
        </Alert>
      ) : (
        <>
          <div className="mb-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRows}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#9CA3AF"
                  fontSize={11}
                  minTickGap={16}
                  tickFormatter={(value: string) =>
                    formatWeekdayDayMonth(value)
                  }
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value: number) =>
                    moneyView
                      ? formatMXNCompact(value)
                      : `${value.toLocaleString("es-MX")} kg`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                  labelFormatter={formatExpectedTooltipLabel}
                  formatter={
                    moneyView
                      ? formatExpectedMoneyTooltipValue
                      : formatExpectedTooltipValue
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={moneyView ? "comparableReportedMoney" : "reportedKg"}
                  name={moneyView ? "Venta comparable" : "Kg vendidos"}
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey={moneyView ? "expectedMoney" : "expectedKg"}
                  name={moneyView ? "Mínimo esperado" : "Kg esperados"}
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <Table hoverable className="dark">
              <TableHead>
                <TableRow>
                  <TableHeadCell>Día</TableHeadCell>
                  {moneyView ? (
                    <>
                      <TableHeadCell>Kg esperados</TableHeadCell>
                      <TableHeadCell>
                        {hasMultipleBranches
                          ? "Precio efectivo/kg"
                          : "Precio/kg"}
                      </TableHeadCell>
                      <TableHeadCell>Mín. esperado</TableHeadCell>
                      <TableHeadCell>Venta total</TableHeadCell>
                      <TableHeadCell>Venta comparable</TableHeadCell>
                      <TableHeadCell>Diferencia</TableHeadCell>
                    </>
                  ) : (
                    <>
                      <TableHeadCell>Pollos vendidos</TableHeadCell>
                      <TableHeadCell>Peso promedio</TableHeadCell>
                      <TableHeadCell>Kg esperados</TableHeadCell>
                      <TableHeadCell>Kg vendidos</TableHeadCell>
                      <TableHeadCell>Diferencia</TableHeadCell>
                      <TableHeadCell>Variación</TableHeadCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-gray-700">
                {dailyRows.map((row) => (
                  <TableRow key={row.day} className="bg-gray-800">
                    <TableCell className="font-medium text-white">
                      {formatWeekdayDayMonth(row.day)}
                    </TableCell>
                    {moneyView ? (
                      <>
                        <TableCell className="text-white">
                          {formatKgValue(row.expectedKg)}
                        </TableCell>
                        <TableCell className="text-white">
                          <span>
                            {formatPricePerKg(row.referencePricePerKg)}
                          </span>
                          {row.priceAsOf && !hasMultipleBranches && (
                            <span className="block text-[11px] text-gray-500">
                              Precio del {formatFullDate(row.priceAsOf)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatMoney(row.expectedMoney)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatMoney(row.reportedMoney)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatMoney(row.comparableReportedMoney)}
                        </TableCell>
                        <TableCell
                          className={moneyStateClass(
                            moneyComparisonState(
                              row.expectedMoney,
                              row.comparableReportedMoney,
                            ),
                          )}
                        >
                          {formatMoney(row.moneyDifference)}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-white">
                          {formatBirds(row.birdsSold)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatChickenWeight(row.avgChickenWeight)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatKgValue(row.expectedKg)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatKgValue(row.reportedKg)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatKgValue(row.differenceKg)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatVariance(row.variancePct)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {hasMultipleBranches
              ? "Suma de las sucursales seleccionadas. "
              : ""}
            {moneyView
              ? `El mínimo usa el último precio de venta de referencia de cada día. El gráfico compara la venta comparable contra el mínimo; la tabla muestra también la venta total. Se permite ${MONEY_REVIEW_TOLERANCE_PCT}% de tolerancia por redondeo. No es una meta ni una proyección.`
              : "Solo se incluyen ventas de remesa con peso promedio y kilos vendidos registrados."}
          </p>
        </>
      )}

      {configOpen && asOf && canConfigure && (
        <ReferenceProductModal
          asOf={asOf}
          onClose={() => setConfigOpen(false)}
        />
      )}
    </Card>
  );
};
