import { http } from "@/shared/api/http";

const API_BASE = "/api/read/accounts-payable";

export interface FinancialSummaryDTO {
  branchId: number;
  branchName: string;
  debt: number;
  pendingAmount: number;
  inventoryValue: number;
  netBalance: number;
}

export const getFinancialSummary = async (
  branchIds?: number[],
  from?: string,
  to?: string,
): Promise<FinancialSummaryDTO[]> => {
  const params = new URLSearchParams();
  if (branchIds && branchIds.length > 0) {
    for (const id of branchIds) {
      params.append("branchIds", String(id));
    }
  }
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  const query = params.toString();
  const { data } = await http.get<FinancialSummaryDTO[]>(
    `${API_BASE}/financial-summary${query ? `?${query}` : ""}`,
  );
  return data;
};

export const downloadFinancialSummaryPdf = async (
  branchIds?: number[],
  from?: string,
  to?: string,
): Promise<Blob> => {
  const params = new URLSearchParams();
  if (branchIds && branchIds.length > 0) {
    for (const id of branchIds) {
      params.append("branchIds", String(id));
    }
  }
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  const query = params.toString();
  const response = await http.get<Blob>(
    `${API_BASE}/financial-summary/pdf${query ? `?${query}` : ""}`,
    { responseType: "blob" },
  );
  return new Blob([response.data], { type: "application/pdf" });
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
