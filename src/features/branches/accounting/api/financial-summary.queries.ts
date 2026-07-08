import { useQuery } from "@tanstack/react-query";
import {
  getFinancialSummary,
  downloadFinancialSummaryPdf,
  triggerDownload,
} from "./financial-summary.api";

export const useFinancialSummary = (branchIds?: number[]) => {
  return useQuery({
    queryKey: ["financialSummary", branchIds],
    queryFn: () => getFinancialSummary(branchIds),
    staleTime: 1000 * 60 * 5,
  });
};

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const buildFilename = (
  branchIds: number[] | undefined,
  rows: { branchName: string }[],
): string => {
  const now = new Date();
  const datePart = `${now.getDate()}_de_${MONTHS_ES[now.getMonth()]}`;

  const allBranches = !branchIds || branchIds.length === 0;
  const namePart = allBranches
    ? "todas_sucursales"
    : rows
        .map((r) => r.branchName)
        .filter(Boolean)
        .join("_y_")
        .replaceAll(/\s+/g, "_")
        .toLowerCase();

  return `reporte_financiero_${namePart}_${datePart}.pdf`;
};

export const useDownloadFinancialSummaryPdf = () => {
  return {
    download: async (branchIds?: number[]) => {
      const blob = await downloadFinancialSummaryPdf(branchIds);
      const rows = await getFinancialSummary(
        branchIds && branchIds.length > 0 ? branchIds : undefined,
      );
      const filename = buildFilename(branchIds, rows);
      triggerDownload(blob, filename);
    },
  };
};
