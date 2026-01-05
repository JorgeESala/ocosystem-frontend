import { http } from "@/shared/api/http";
import {
  ChickenLoss,
  ChickenLossResponseDTO,
  ChickenLossCreateDTO,
  ChickenLossUpdateDTO,
} from "../types/chickenLoss.types";

// =====================
// MAPPERS
// =====================
const mapToModel = (dto: ChickenLossResponseDTO): ChickenLoss => ({
  ...dto,
  date: new Date(dto.date),
});

const mapToCreateDTO = (
  model: Omit<ChickenLoss, "id">,
): ChickenLossCreateDTO => ({
  ...model,
  date: model.date.toISOString().split("T")[0],
});
const BASE_URL = "/api/live-chicken/chicken-losses";
const mapToUpdateDTO = (model: ChickenLoss): ChickenLossUpdateDTO => ({
  quantity: model.quantity,
  weight: model.weight,
  lossAmount: model.lossAmount,
  batchId: model.batchId,
  date: model.date.toISOString().split("T")[0],
});

// =====================
// REQUESTS
// =====================
export const fetchChickenLosses = async (): Promise<ChickenLoss[]> => {
  const res = await http.get<ChickenLossResponseDTO[]>(BASE_URL);
  return res.data.map(mapToModel);
};

export const fetchChickenLossesByBatchId = async (
  id: number,
): Promise<ChickenLoss[]> => {
  const res = await http.get<ChickenLossResponseDTO[]>(
    `${BASE_URL}/by-batch/${id}`,
  );
  return res.data.map(mapToModel);
};

export const createChickenLoss = async (
  data: Omit<ChickenLoss, "id">,
): Promise<ChickenLoss> => {
  const res = await http.post<ChickenLossResponseDTO>(
    `${BASE_URL}`,
    mapToCreateDTO(data),
  );
  return mapToModel(res.data);
};

export const updateChickenLoss = async (
  id: number,
  data: ChickenLoss,
): Promise<ChickenLoss> => {
  const res = await http.put<ChickenLossResponseDTO>(
    `${BASE_URL}/${id}`,
    mapToUpdateDTO(data),
  );
  return mapToModel(res.data);
};
