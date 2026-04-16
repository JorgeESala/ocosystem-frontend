import { http } from "@/shared/api/http";
import type { Route } from "../types";

export const getRoutes = async () => {
  const { data } = await http.get<Route[]>("/api/v1/routes");
  return data;
};
