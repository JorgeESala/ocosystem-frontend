// src/api/report/report.api.ts

import { http } from "@/shared/api/http";
import type { ConfirmSalesImportRequestDTO } from "../types";

export const uploadSalesReports = async (branchId: number, files: File[]) => {
  const formData = new FormData();

  formData.append("branchId", branchId.toString());

  files.forEach((file) => {
    formData.append("files", file);
  });

  const { data } = await http.post("/api/sales-import/preview", formData);

  return data;
};

export const confirmSalesImport = async (
  payload: ConfirmSalesImportRequestDTO,
) => {
  const { data } = await http.post("/api/sales-import/confirm", payload);

  return data;
};
