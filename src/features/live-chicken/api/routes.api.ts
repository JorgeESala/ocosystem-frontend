import { http } from "@/shared/api/http";
import type { Route } from "../types";

const BASE_URL = "/api/live-chicken/routes";

export const getRoutes = async (): Promise<Route[]> => {
  const { data } = await http.get<Route[]>(BASE_URL);
  return data;
};

export const createRoute = async (payload: {
  name: string;
}): Promise<Route> => {
  const { data } = await http.post(BASE_URL, payload);
  return data;
};
