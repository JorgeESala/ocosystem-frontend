import React, { useState, useCallback } from "react";
import { Spinner, Alert, Button, Datepicker } from "flowbite-react";
import { HiDocumentDownload } from "react-icons/hi";
import type { BusinessUnitType } from "@/features/batch/types.batch";
import { toLocalDateString } from "@/utils/date.utils";
import { triggerDownload } from "@/features/branches/accounting/api/financial-summary.api";
import { useProfitReport } from "../api/profit.queries";
import { downloadProfitReportPdf } from "../api/profit.api";
import { ProfitSummaryCards } from "../components/ProfitSummaryCards";
import { ProfitBatchTable } from "../components/ProfitBatchTable";
import { ProfitExpenseBreakdown } from "../components/ProfitExpenseBreakdown";

export interface ProfitReportPageProps {
  unitType: BusinessUnitType;
}

const THIRTY_DAYS_AGO = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
})();

export const ProfitReportPage: React.FC<ProfitReportPageProps> = ({
  unitType,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(THIRTY_DAYS_AGO);
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isDownloading, setIsDownloading] = useState(false);

  const startStr = startDate ? toLocalDateString(startDate) : null;
  const endStr = endDate ? toLocalDateString(endDate) : null;

  const { data, isLoading, isError } = useProfitReport(
    unitType,
    startStr,
    endStr,
  );

  const handleClearFilter = useCallback(() => {
    setStartDate(THIRTY_DAYS_AGO);
    setEndDate(new Date());
  }, []);

  const handleDownloadPdf = async () => {
    if (!startStr || !endStr) return;
    setIsDownloading(true);
    try {
      const blob = await downloadProfitReportPdf(startStr, endStr);
      triggerDownload(blob, `reporte_ganancias_${unitType.toLowerCase()}.pdf`);
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
            Reporte de Ganancias {title && `· ${title}`}
          </h1>
          <p className="text-gray-400">
            Ventas, costos prorrateados, merma, gastos y ganancia neta del
            periodo.
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
          Error al cargar el reporte de ganancias.
        </Alert>
      )}

      {data && (
        <>
          <ProfitSummaryCards
            totalSales={data.totalSales}
            totalChickenCostsProRated={data.totalChickenCostsProRated}
            totalMermaCost={data.totalMermaCost}
            totalExpenses={data.totalExpenses}
            profit={data.profit}
          />

          <ProfitExpenseBreakdown items={data.expenseBreakdown} />

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-white">
              Desglose por Remesa
            </h2>
            <ProfitBatchTable details={data.batchDetails} unitType={unitType} />
          </div>
        </>
      )}
    </div>
  );
};
