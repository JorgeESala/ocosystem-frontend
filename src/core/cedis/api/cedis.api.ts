import { http } from "@/shared/api/http";

export interface CedisResponseDTO {
  id: number;
  name: string;
}

export const cedisApi = {
  getAll: async (): Promise<CedisResponseDTO[]> => {
    const { data } = await http.get<CedisResponseDTO[]>("/api/cedis");
    return data;
  },
};
