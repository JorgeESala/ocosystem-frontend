import { useQuery } from "@tanstack/react-query";
import {
  getFinancialSummary,
  downloadFinancialSummaryPdf,
  triggerDownload,
  getCedisFinancialSummary,
  downloadCedisFinancialSummaryPdf,
} from "./financial-summary.api";

export const useFinancialSummary = (
  branchIds?: number[],
  from?: string,
  to?: string,
) => {
  return useQuery({
    queryKey: ["financialSummary", branchIds, from, to],
    queryFn: () => getFinancialSummary(branchIds, from, to),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCedisFinancialSummary = (
  cedisIds?: number[],
  entityType?: string,
) => {
  return useQuery({
    queryKey: ["cedisFinancialSummary", cedisIds, entityType],
    queryFn: () => getCedisFinancialSummary(cedisIds, entityType),
    staleTime: 1000 * 60 * 5,
  });
};

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const buildFilename = (
  ids: number[] | undefined,
  rows: { branchName?: string; cedisName?: string }[],
  prefix: string,
): string => {
  const now = new Date();
  const datePart = `${now.getDate()}_de_${MONTHS_ES[now.getMonth()]}`;

  const allIds = !ids || ids.length === 0;
  const namePart = allIds
    ? "todos"
    : rows
        .map((r) => r.branchName ?? r.cedisName)
        .filter(Boolean)
        .join("_y_")
        .replace(/\s+/g, "_")
        .toLowerCase();

  return `${prefix}_${namePart}_${datePart}.pdf`;
};

export const useDownloadFinancialSummaryPdf = () => {
  return {
    download: async (branchIds?: number[], from?: string, to?: string) => {
      const blob = await downloadFinancialSummaryPdf(branchIds, from, to);
      const rows = await getFinancialSummary(
        branchIds && branchIds.length > 0 ? branchIds : undefined,
        from,
        to,
      );
      const filename = buildFilename(branchIds, rows, "reporte_financiero");
      triggerDownload(blob, filename);
    },
  };
};

export const useDownloadCedisFinancialSummaryPdf = () => {
  return {
    download: async (cedisIds?: number[], entityType?: string) => {
      const blob = await downloadCedisFinancialSummaryPdf(cedisIds, entityType);
      const rows = await getCedisFinancialSummary(
        cedisIds && cedisIds.length > 0 ? cedisIds : undefined,
        entityType,
      );
      const filename = buildFilename(cedisIds, rows, "reporte_financiero_cedis");
      triggerDownload(blob, filename);
    },
  };
};
