import type { Client } from "@/core/api/types";
import { http } from "@/shared/api/http";

export const getClients = async () => {
  const { data } = await http.get<Client[]>("/api/v1/clients");
  return data;
};
export const createClient = async (client: Partial<Client>) => {
  const { data } = await http.post<Client>("/api/v1/clients", client);
  return data;
};
