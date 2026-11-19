import { useMemo } from "react";
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
import { formatWeekdayDayMonth } from "@/utils/date.utils";
import type { ExpectedSalesReportDTO } from "../api/expectedSales.api";
import {
  aggregateExpectedDaily,
  formatBirds,
  formatChickenWeight,
  formatExpectedTooltipLabel,
  formatExpectedTooltipValue,
  formatKg,
  formatKgValue,
  formatVariance,
} from "../utils/expectedSales";

interface Props {
  data?: ExpectedSalesReportDTO;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  scopeLabel?: string;
}

const SummaryItem = ({
  label,
  value,
  hint,
  info,
}: {
  label: string;
  value: string;
  hint?: string;
  info?: ReactNode;
}) => (
  <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
    <p className="flex items-center gap-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
      {label}
      {info}
    </p>
    <p className="mt-1 text-xl font-bold text-white">{value}</p>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

export const ExpectedSalesSection = ({
  data,
  isLoading = false,
  isError = false,
  onRetry,
  scopeLabel,
}: Props) => {
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

  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <h3 className="flex items-center gap-1 text-lg font-semibold text-gray-200">
          Venta esperada vs vendida (kg)
          <InfoTip title="Venta esperada vs vendida">
            Por cada venta de remesa: (peso promedio del pollo de la remesa −{" "}
            {wasteGrams} g) × pollos vendidos. Si un día hay ventas de varias
            remesas, se suman. No se muestra en dinero porque el precio cambia
            según el tipo de venta.
          </InfoTip>
        </h3>
        {scopeLabel && (
          <span className="text-xs text-gray-500">{scopeLabel}</span>
        )}
      </div>

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
                    `${value.toLocaleString("es-MX")} kg`
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
                  formatter={formatExpectedTooltipValue}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reportedKg"
                  name="Kg vendidos"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="expectedKg"
                  name="Kg esperados"
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
                  <TableHeadCell>Pollos vendidos</TableHeadCell>
                  <TableHeadCell>Peso promedio</TableHeadCell>
                  <TableHeadCell>Kg esperados</TableHeadCell>
                  <TableHeadCell>Kg vendidos</TableHeadCell>
                  <TableHeadCell>Diferencia</TableHeadCell>
                  <TableHeadCell>Variación</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-gray-700">
                {dailyRows.map((row) => (
                  <TableRow key={row.day} className="bg-gray-800">
                    <TableCell className="font-medium text-white">
                      {formatWeekdayDayMonth(row.day)}
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {hasMultipleBranches
              ? "Suma de las sucursales seleccionadas. "
              : ""}
            Solo se incluyen ventas de remesa con peso promedio y kilos vendidos
            registrados.
          </p>
        </>
      )}
    </Card>
  );
};
