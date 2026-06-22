import type { BranchesBatchSale } from "@/services/api";
import { http } from "@/shared/api/http";

const API_URL = "/api/v1/batch-sales";

interface BranchSaleItemApi {
  id: number;
  batchId: number | null;
  branchId: number | null;
  employeeId: number;
  employeeName: string;
  clientId: number | null;
  clientName: string;
  quantitySold: string;
  kgTotal: string;
  kgGut: string;
  saleTotal: string;
  date: string;
  officeReceived: boolean;
}

interface BranchSaleResponseApi {
  id: number;
  batchId: number | null;
  saleDate: string;
  employeeId: number;
  employeeName: string;
  routeId: number | null;
  routeName: string;
  clientName: string;
  saleTotal: string;
  quantity: string;
  metadata: Record<string, unknown>;
  clientId?: number;
  kgTotal?: string;
  kgGut?: string;
  officeReceived?: boolean;
}

const toNumber = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const mapItem = (raw: BranchSaleItemApi): BranchesBatchSale => ({
  id: raw.id,
  batchId: raw.batchId,
  branchId: raw.branchId,
  employeeId: raw.employeeId,
  employeeName: raw.employeeName,
  clientId: raw.clientId,
  clientName: raw.clientName,
  quantitySold: toNumber(raw.quantitySold),
  kgTotal: toNumber(raw.kgTotal),
  kgGut: toNumber(raw.kgGut),
  saleTotal: toNumber(raw.saleTotal),
  date: raw.date,
  officeReceived: Boolean(raw.officeReceived),
});

const mapResponse = (raw: BranchSaleResponseApi): BranchesBatchSale => ({
  id: raw.id,
  batchId: raw.batchId,
  branchId: null,
  employeeId: raw.employeeId,
  employeeName: raw.employeeName,
  clientId: raw.clientId ?? null,
  clientName: raw.clientName,
  quantitySold: toNumber(raw.quantity),
  kgTotal: toNumber(raw.kgTotal),
  kgGut: toNumber(raw.kgGut),
  saleTotal: toNumber(raw.saleTotal),
  date: raw.saleDate,
  officeReceived: Boolean(raw.officeReceived),
});

export const salesApi = {
  getByBatchId: async (batchId: number): Promise<BranchesBatchSale[]> => {
    const { data } = await http.get<BranchSaleItemApi[]>(
      `${API_URL}/batch/${batchId}`,
    );
    return data.map(mapItem);
  },

  searchByBatchIds: async (
    batchIds: number[],
  ): Promise<BranchesBatchSale[]> => {
    const { data } = await http.post<BranchSaleItemApi[]>(
      `${API_URL}/search`,
      { batchIds },
    );
    return data.map(mapItem);
  },

  updateOfficeStatus: async (
    saleId: number,
    officeReceived: boolean,
  ): Promise<BranchesBatchSale> => {
    const { data } = await http.patch<BranchSaleResponseApi>(
      `${API_URL}/${saleId}/office-status`,
      { officeReceived },
    );
    return mapResponse(data);
  },
};
