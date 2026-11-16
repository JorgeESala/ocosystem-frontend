import { http } from "@/shared/api/http";
import type {
  BranchApiKeyDTO,
  CreatedApiKeyDTO,
  LatestVersionDTO,
} from "../types";

export const getApiKeys = async (): Promise<BranchApiKeyDTO[]> => {
  const { data } = await http.get("/api/branch-app/keys");
  return data;
};

export const getLatestVersion = async (): Promise<LatestVersionDTO> => {
  const { data } = await http.get("/api/branch-app/latest-version");
  return data;
};

export const createApiKey = async (payload: {
  branchId: number;
  label: string | null;
}): Promise<CreatedApiKeyDTO> => {
  const { data } = await http.post("/api/branch-app/keys", payload);
  return data;
};

export const revokeApiKey = async (id: number): Promise<void> => {
  await http.delete(`/api/branch-app/keys/${id}`);
};
