import { http } from "@/shared/api/http";
import type { Client } from "../types/client.types";

const BASE_URL = "/api/processed/clients";

export interface ClientCreateDTO {
  name: string;
}

export interface ClientUpdateDTO {
  name: string;
}

export const getClients = async (): Promise<Client[]> => {
  const { data } = await http.get<Client[]>(BASE_URL);
  return data;
};

export const getClientById = async (id: number): Promise<Client> => {
  const { data } = await http.get<Client>(`${BASE_URL}/${id}`);
  return data;
};

export const createClient = async (
  payload: ClientCreateDTO,
): Promise<Client> => {
  const { data } = await http.post<Client>(BASE_URL, payload);
  return data;
};

export const updateClient = async (
  id: number,
  payload: ClientUpdateDTO,
): Promise<Client> => {
  const { data } = await http.put<Client>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await http.delete(`${BASE_URL}/${id}`);
};
