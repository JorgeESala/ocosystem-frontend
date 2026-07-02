import { http } from "@/shared/api/http";
import type { WeeklyWeightDiffBatchRow, WeeklyWeightDiffRow } from "./types";

const API_BASE = "/api/v1";

const toDateParam = (value: string): string => {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getWeeklyWeightDiff = async (
  startDate: string,
  endDate: string,
): Promise<WeeklyWeightDiffRow[]> => {
  const params = new URLSearchParams({
    startDate: toDateParam(startDate),
    endDate: toDateParam(endDate),
  });
  const { data } = await http.get<WeeklyWeightDiffRow[]>(
    `${API_BASE}/batches/weight-diff-by-week?${params}`,
  );
  return data;
};

export const getWeeklyWeightDiffBatches = async (
  weekStart: string,
  supplierId: number | null,
): Promise<WeeklyWeightDiffBatchRow[]> => {
  const params = new URLSearchParams({ weekStart: toDateParam(weekStart) });
  if (supplierId != null) params.append("supplierId", String(supplierId));
  const { data } = await http.get<WeeklyWeightDiffBatchRow[]>(
    `${API_BASE}/batches/weight-diff-batches?${params.toString()}`,
  );
  return data;
};

export const downloadWeeklyWeightDiffPdf = async (
  startDate: string,
  endDate: string,
  supplierId: number | null,
): Promise<Blob> => {
  const params = new URLSearchParams({
    startDate: toDateParam(startDate),
    endDate: toDateParam(endDate),
  });
  if (supplierId != null) params.append("supplierId", String(supplierId));
  const response = await http.get<Blob>(
    `${API_BASE}/batches/weight-diff-by-week/pdf?${params.toString()}`,
    { responseType: "blob" },
  );
  return new Blob([response.data], { type: "application/pdf" });
};

export const downloadWeeklyWeightDiffExcel = async (
  startDate: string,
  endDate: string,
  supplierId: number | null,
): Promise<Blob> => {
  const params = new URLSearchParams({
    startDate: toDateParam(startDate),
    endDate: toDateParam(endDate),
  });
  if (supplierId != null) params.append("supplierId", String(supplierId));
  const response = await http.get<Blob>(
    `${API_BASE}/batches/weight-diff-by-week/excel?${params.toString()}`,
    { responseType: "blob" },
  );
  return new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

export const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
