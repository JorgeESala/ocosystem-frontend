import type { MeasurementUnit } from "@/services/api";
import { http } from "@/shared/api/http";

export const getMeasurementUnits = async (): Promise<MeasurementUnit[]> => {
  const { data } = await http.get("/api/measurement-units");
  return data;
};

export const createMeasurementUnit = async (payload: {
  name: string;
}): Promise<MeasurementUnit> => {
  const { data } = await http.post("/api/measurement-units", payload);
  return data;
};

export const updateMeasurementUnit = async (
  id: number,
  payload: { name: string },
): Promise<MeasurementUnit> => {
  const { data } = await http.put(`/api/measurement-units/${id}`, payload);
  return data;
};

export const deleteMeasurementUnit = async (id: number): Promise<void> => {
  await http.delete(`/api/measurement-units/${id}`);
};
