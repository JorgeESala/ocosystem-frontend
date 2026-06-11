import type { Client } from "@/core/api/types";
import { http } from "@/shared/api/http";

export interface ClientCreateRequestDTO {
  name: string;
  accountingEntityId?: number | null;
  localityId?: number | null;
  isInternalBranch?: boolean;
}

export const getClients = async (): Promise<Client[]> => {
  const { data } = await http.get<Client[]>("/api/v1/clients");
  return data;
};

export const createClient = async (
  client: ClientCreateRequestDTO,
): Promise<Client> => {
  const { data } = await http.post<Client>("/api/v1/clients", client);
  return data;
};
