import { http } from "@/shared/api/http";
import type {
  EggPriceReferenceDTO,
  EggPriceReferenceSaveDTO,
} from "../types/routeOrder.types";

const BASE_URL = "/api/v1/egg-price-reference";

export const getCurrentEggPriceReference = async (
  date: string,
): Promise<EggPriceReferenceDTO | null> => {
  const { data } = await http.get<EggPriceReferenceDTO | null>(BASE_URL, {
    params: { date },
  });
  return data || null;
};

export const getEggPriceReferenceHistory = async (): Promise<
  EggPriceReferenceDTO[]
> => {
  const { data } = await http.get<EggPriceReferenceDTO[]>(
    `${BASE_URL}/history`,
  );
  return data;
};

export const saveEggPriceReference = async (
  payload: EggPriceReferenceSaveDTO,
): Promise<EggPriceReferenceDTO> => {
  const { data } = await http.post<EggPriceReferenceDTO>(BASE_URL, payload);
  return data;
};
