import { http } from "@/shared/api/http";
import { toApiDateRange } from "@/utils/date.utils";

export interface ExpectedSalesSummaryDTO {
  expectedKg: number | null;
  reportedKg: number | null;
  differenceKg: number | null;
  variancePct: number | null;
  birdsSold: number;
  avgChickenWeight: number | null;
  salesCount: number;
  salesWithoutWeight: number;
  salesWithoutReportedKg: number;
  daysWithData: number;
  wastePerChickenKg: number;
  reportedMoney: number | null;
  comparableReportedMoney: number | null;
  expectedMoney: number | null;
  moneyDifference: number | null;
  effectivePricePerKg: number | null;
  daysWithoutPrice: number;
  comparableDays: number;
  branchesWithoutReference: number;
  salesWithZeroMoney: number;
  salesWithoutReportedMoney: number;
  daysWithoutReportedMoney: number;
}

export interface BranchExpectedSalesDTO {
  branchId: number;
  branchName: string;
  expectedKg: number | null;
  reportedKg: number | null;
  differenceKg: number | null;
  variancePct: number | null;
  birdsSold: number;
  avgChickenWeight: number | null;
  salesCount: number;
  salesWithoutWeight: number;
  salesWithoutReportedKg: number;
  daysWithData: number;
  referenceProductBarcode: string | null;
  referenceProductName: string | null;
  referencePricePerKg: number | null;
  priceAsOf: string | null;
  reportedMoney: number | null;
  comparableReportedMoney: number | null;
  expectedMoney: number | null;
  moneyDifference: number | null;
  effectivePricePerKg: number | null;
  priceMissingDays: number;
  comparableDays: number;
  salesWithZeroMoney: number;
  salesWithoutReportedMoney: number;
  daysWithoutReportedMoney: number;
}

export interface DailyExpectedSalesDTO {
  branchId: number;
  branchName: string;
  day: string;
  expectedKg: number | null;
  reportedKg: number | null;
  differenceKg: number | null;
  variancePct: number | null;
  birdsSold: number;
  avgChickenWeight: number | null;
  salesCount: number;
  salesWithoutWeight: number;
  salesWithoutReportedKg: number;
  referencePricePerKg: number | null;
  priceAsOf: string | null;
  reportedMoney: number | null;
  comparableReportedMoney: number | null;
  expectedMoney: number | null;
  moneyDifference: number | null;
  salesWithZeroMoney: number;
  salesWithoutReportedMoney: number;
}

export interface ExpectedSalesReportDTO {
  summary: ExpectedSalesSummaryDTO;
  branches: BranchExpectedSalesDTO[];
  daily: DailyExpectedSalesDTO[];
}

export interface ReferenceProductDTO {
  branchId: number;
  branchName: string;
  productBarcode: string | null;
  productName: string | null;
  unitName: string | null;
  pricePerKg: number | null;
  priceAsOf: string | null;
}

export const fetchExpectedSalesReport = async (
  branchIds: number[],
  start: Date,
  end: Date,
) => {
  const range = toApiDateRange(start, end);
  const params = new URLSearchParams();
  branchIds.forEach((id) => params.append("branchIds", id.toString()));
  params.append("startDate", range.startDate);
  params.append("endDate", range.endDate);

  const { data } = await http.get<ExpectedSalesReportDTO>(
    `/api/reports/sales/expected?${params.toString()}`,
  );
  return data;
};

export const fetchReferenceProducts = async (asOf: string) => {
  const params = new URLSearchParams({ asOf });

  const { data } = await http.get<ReferenceProductDTO[]>(
    `/api/reports/sales/expected/reference-products?${params.toString()}`,
  );
  return data;
};

export const updateReferenceProduct = async (
  branchId: number,
  productBarcode: string,
) => {
  const { data } = await http.put<ReferenceProductDTO>(
    `/api/reports/sales/expected/reference-products/${branchId}`,
    { productBarcode },
  );
  return data;
};

export const deleteReferenceProduct = async (branchId: number) => {
  await http.delete(
    `/api/reports/sales/expected/reference-products/${branchId}`,
  );
};
