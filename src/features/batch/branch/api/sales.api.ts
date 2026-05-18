import type { BranchesBatchSale } from "@/services/api";
import { http } from "@/shared/api/http";

const API_URL = "/api/batchSales";

export const salesApi = {
  // Obtener ventas por lote (la que alimenta tu tabla actual)
  getByBatchId: async (batchId: number): Promise<BranchesBatchSale[]> => {
    const { data } = await http.get<BranchesBatchSale[]>(
      `${API_URL}/batch/${batchId}`,
    );
    return data;
  },

  // -> NUEVO: Endpoint para mutar el estado de recepción en oficina
  updateOfficeStatus: async (
    saleId: number,
    officeReceived: boolean,
  ): Promise<BranchesBatchSale> => {
    const { data } = await http.patch<BranchesBatchSale>(
      `${API_URL}/${saleId}/office-status`,
      {
        officeReceived,
      },
    );
    return data;
  },
};
