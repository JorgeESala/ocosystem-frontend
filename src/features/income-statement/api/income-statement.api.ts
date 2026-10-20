import { http } from "@/shared/api/http";
import type { IncomeStatement } from "../types/income-statement.types";

const API_BASE = "/api/v1";

export const getIncomeStatement = async (
  start: string,
  end: string,
): Promise<IncomeStatement> => {
  const params = new URLSearchParams({ start, end });
  const { data } = await http.get<IncomeStatement>(
    `${API_BASE}/reports/income-statement?${params}`,
  );
  return data;
};

export const downloadIncomeStatementPdf = async (
  start: string,
  end: string,
): Promise<Blob> => {
  const params = new URLSearchParams({ start, end });
  const response = await http.get<Blob>(
    `${API_BASE}/reports/income-statement/pdf?${params}`,
    { responseType: "blob" },
  );
  return new Blob([response.data], { type: "application/pdf" });
};
