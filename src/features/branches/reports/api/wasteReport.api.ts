import { http } from "@/shared/api/http";
import { toApiDateRange } from "@/utils/date.utils";

export interface WasteTotalsDTO {
  lossQuantity: number;
  operationalQuantity: number;
  totalQuantity: number;
  totalValue: number;
}

export interface WasteProductBranchDTO {
  branchId: number;
  branchName: string;
  quantity: number;
  value: number;
}

export interface WasteProductDTO {
  productBarcode: string;
  productName: string;
  tripa: boolean;
  quantity: number;
  value: number;
  branchBreakdown: WasteProductBranchDTO[];
}

export interface WasteBranchDTO {
  branchId: number;
  branchName: string;
  lossQuantity: number;
  tripaQuantity: number;
  totalQuantity: number;
  value: number;
}

export interface WasteReportDTO {
  totals: WasteTotalsDTO;
  byProduct: WasteProductDTO[];
  byBranch: WasteBranchDTO[];
}

export const fetchWasteReport = async (
  branchIds: number[],
  start: Date,
  end: Date,
) => {
  const range = toApiDateRange(start, end);
  const params = new URLSearchParams();
  branchIds.forEach((id) => params.append("branchIds", id.toString()));
  params.append("startDate", range.startDate);
  params.append("endDate", range.endDate);

  const { data } = await http.get<WasteReportDTO>(
    `/api/reports/waste?${params.toString()}`,
  );
  return data;
};
