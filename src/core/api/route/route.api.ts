import { http } from "@/shared/api/http";
import type { Route } from "../types";

const BASE_URL = "/api/v1/routes";

export const getRoutes = async (): Promise<Route[]> => {
  const { data } = await http.get<Route[]>(BASE_URL);
  return data;
};

export const getRoute = async (id: number): Promise<Route> => {
  const { data } = await http.get<Route>(`${BASE_URL}/${id}`);
  return data;
};

export const createRoute = async (payload: {
  name: string;
}): Promise<Route> => {
  const { data } = await http.post<Route>(BASE_URL, payload);
  return data;
};

export const updateRoute = async (
  id: number,
  payload: { name: string },
): Promise<Route> => {
  const { data } = await http.put<Route>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteRoute = async (id: number): Promise<void> => {
  await http.delete(`${BASE_URL}/${id}`);
};
