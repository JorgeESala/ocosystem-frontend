import React, { useEffect, useState } from "react";
import { Alert, Button, Datepicker, Spinner } from "flowbite-react";
import { HiDocumentDownload } from "react-icons/hi";
import { useSearchParams } from "react-router-dom";
import type { BusinessUnitType } from "@/features/batch/types.batch";
import { stringToDate, toLocalDateString } from "@/utils/date.utils";
import { triggerDownload } from "@/features/branches/accounting/api/financial-summary.api";
import { useIncomeStatement } from "../api/income-statement.queries";
import { downloadIncomeStatementPdf } from "../api/income-statement.api";
import { SummaryCards } from "../components/SummaryCards";
import { StatementSection } from "../components/StatementSection";
import { CashPeriodSection } from "../components/CashPeriodSection";
import { CashBridgePanel } from "../components/CashBridgePanel";
import { RouteBreakdownTable } from "../components/RouteBreakdownTable";

export interface IncomeStatementPageProps {
  unitType: BusinessUnitType;
}

const defaultStart = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toLocalDateString(d);
};

export const IncomeStatementPage: React.FC<IncomeStatementPageProps> = ({
  unitType,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [startDate, setStartDate] = useState<Date | null>(() => {
    const from = searchParams.get("from");
    return from ? stringToDate(from) : stringToDate(defaultStart());
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const to = searchParams.get("to");
    return to ? stringToDate(to) : new Date();
  });
  const [isDownloading, setIsDownloading] = useState(false);

  const startStr = startDate ? toLocalDateString(startDate) : null;
  const endStr = endDate ? toLocalDateString(endDate) : null;

  useEffect(() => {
    if (!startStr || !endStr) return;
    const next = new URLSearchParams();
    next.set("from", startStr);
    next.set("to", endStr);
    setSearchParams(next, { replace: true });
  }, [startStr, endStr, setSearchParams]);

  const { data, isLoading, isError } = useIncomeStatement(
    unitType,
    startStr,
    endStr,
  );

  const handleClearFilter = () => {
    setStartDate(stringToDate(defaultStart()));
    setEndDate(new Date());
  };

  const handleDownloadPdf = async () => {
    if (!startStr || !endStr) return;
    setIsDownloading(true);
    try {
      const blob = await downloadIncomeStatementPdf(startStr, endStr);
      triggerDownload(blob, `estado_resultados_${unitType.toLowerCase()}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  const title =
    unitType === "LIVE_CHICKEN"
      ? "Pollo vivo"
      : unitType === "EGG"
        ? "Huevo"
        : "";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <header className="flex items-center justify-between border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Estado de Resultados {title && `· ${title}`}
          </h1>
          <p className="text-gray-400">
            Ingresos, costo de ventas, gastos de operación y utilidad del
            periodo, con el efectivo cobrado y el desglose por ruta.
          </p>
        </div>
        <Button
          color="gray"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isDownloading || !data}
        >
          <HiDocumentDownload className="mr-2 h-4 w-4" />
          {isDownloading ? "Generando..." : "Exportar PDF"}
        </Button>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Inicio</label>
          <Datepicker
            language="es-MX"
            value={startDate}
            onChange={(d) => d && setStartDate(d)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Fin</label>
          <Datepicker
            language="es-MX"
            value={endDate}
            onChange={(d) => d && setEndDate(d)}
          />
        </div>
        <Button size="xs" color="gray" onClick={handleClearFilter}>
          Limpiar
        </Button>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="xl" />
        </div>
      )}

      {isError && (
        <Alert color="failure" className="my-4">
          Error al cargar el estado de resultados.
        </Alert>
      )}

      {data && (
        <>
          <SummaryCards data={data} />
          <StatementSection data={data} />
          {data.efectivo && <CashPeriodSection efectivo={data.efectivo} />}
          <CashBridgePanel puente={data.puente} />
          <RouteBreakdownTable rutas={data.rutas} />
        </>
      )}
    </div>
  );
};
