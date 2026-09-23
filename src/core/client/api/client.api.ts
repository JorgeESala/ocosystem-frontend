import type { Client, ComparisonMode } from "@/core/api/types";
import { http } from "@/shared/api/http";

export interface ClientCreateRequestDTO {
  name?: string | null;
  accountingEntityId?: number | null;
  localityId?: number | null;
  isInternalBranch?: boolean;
  isInternalClient?: boolean;
  businessName?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface InternalClientCreateRequestDTO {
  name?: string | null;
  businessName?: string | null;
  localityId?: number | null;
  phone?: string | null;
  address?: string | null;
}

export interface ClientPurchaseItem {
  id: number;
  saleDate: string;
  routeId?: number | null;
  routeName?: string | null;
  quantity: number;
  saleTotal: number;
}

export interface ClientPurchases {
  clientId: number;
  totalSales: number;
  totalQuantity: number;
  saleCount: number;
  firstPurchase?: string | null;
  lastPurchase?: string | null;
  previousTotalSales: number;
  salesVariationPct?: number | null;
  sales: ClientPurchaseItem[];
}

const BASE_URL = "/api/v1/clients";
const PURCHASES_URL = "/api/v1/batch-sales/by-client";

export const getClients = async (
  includeInactive = false,
): Promise<Client[]> => {
  const { data } = await http.get<Client[]>(BASE_URL, {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  return data;
};

export const getClient = async (id: number): Promise<Client> => {
  const { data } = await http.get<Client>(`${BASE_URL}/${id}`);
  return data;
};

export const createClient = async (
  client: ClientCreateRequestDTO,
): Promise<Client> => {
  const { data } = await http.post<Client>(BASE_URL, client);
  return data;
};

export const createInternalClient = async (
  client: InternalClientCreateRequestDTO,
): Promise<Client> => {
  const { data } = await http.post<Client>(`${BASE_URL}/internal`, client);
  return data;
};

export const updateClient = async (
  id: number,
  client: ClientCreateRequestDTO,
): Promise<Client> => {
  const { data } = await http.put<Client>(`${BASE_URL}/${id}`, client);
  return data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await http.delete(`${BASE_URL}/${id}`);
};

export const reactivateClient = async (id: number): Promise<Client> => {
  const { data } = await http.patch<Client>(`${BASE_URL}/${id}/reactivate`);
  return data;
};

export const getClientPurchases = async (
  id: number,
  startDate: string,
  endDate: string,
  comparison: ComparisonMode,
): Promise<ClientPurchases> => {
  const { data } = await http.get<ClientPurchases>(`${PURCHASES_URL}/${id}`, {
    params: { startDate, endDate, comparison },
  });
  return data;
};
