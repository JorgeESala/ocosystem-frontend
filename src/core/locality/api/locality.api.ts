import { http } from "@/shared/api/http";

export interface Locality {
  id: number;
  name: string;
}

export interface LocalityCreateRequestDTO {
  name: string;
}

export const localityApi = {
  getAll: async (): Promise<Locality[]> => {
    const { data } = await http.get<Locality[]>("/api/v1/localities");
    return data;
  },
  create: async (payload: LocalityCreateRequestDTO): Promise<Locality> => {
    const { data } = await http.post<Locality>("/api/v1/localities", payload);
    return data;
  },
};
