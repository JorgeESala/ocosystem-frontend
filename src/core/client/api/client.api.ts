import type { Client } from "@/core/api/types";
import { http } from "@/shared/api/http";

export interface ClientCreateRequestDTO {
  name?: string | null;
  accountingEntityId?: number | null;
  localityId?: number | null;
  isInternalBranch?: boolean;
  businessName?: string | null;
}

const BASE_URL = "/api/v1/clients";

export const getClients = async (): Promise<Client[]> => {
  const { data } = await http.get<Client[]>(BASE_URL);
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
