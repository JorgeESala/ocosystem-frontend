import { Alert } from "flowbite-react";
import { InfoTip } from "@/components/InfoTip";
import type { BranchRankingRow } from "../utils/consolidatedMetrics";

interface Props {
  rows: BranchRankingRow[];
  expectedDays: number;
}

export const DataCompletenessBanner = ({ rows, expectedDays }: Props) => {
  if (rows.length === 0) return null;

  const withoutReport = rows.filter((row) => row.daysWithReport === 0);
  const partial = rows.filter(
    (row) => row.daysWithReport > 0 && row.missingDays > 0,
  );

  if (withoutReport.length === 0 && partial.length === 0) return null;

  return (
    <Alert color="warning" className="mb-6">
      <div className="flex items-center gap-1">
        <p className="font-semibold">
          Cobertura de reportes: {rows.length - withoutReport.length} de{" "}
          {rows.length} sucursales reportaron en el periodo.
        </p>
        <InfoTip title="Sin reporte no es cero">
          Los promedios solo usan días con reporte. Una sucursal sin reporte no
          se cuenta como venta en cero, por eso el total puede ser menor a lo
          esperado.
        </InfoTip>
      </div>
      {withoutReport.length > 0 && (
        <p className="mt-1 text-sm">
          Sin reporte: {withoutReport.map((row) => row.branchName).join(", ")}.
        </p>
      )}
      {partial.length > 0 && (
        <p className="mt-1 text-sm">
          {partial.length === 1
            ? "1 sucursal tiene cobertura parcial"
            : `${partial.length} sucursales tienen cobertura parcial`}{" "}
          de los {expectedDays} días del periodo.
        </p>
      )}
    </Alert>
  );
};
