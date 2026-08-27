export type UploadStatus = "ready" | "duplicated" | "uploading";

export type UploadFile = {
  file: File;
  status: UploadStatus;
};
export interface SalesImportPreviewDTO {
  previewId: number;
  branchId: number;
  totalAmount: number;
  totalTickets: number;

  files: FileImportPreviewDTO[];

  newProducts: NewProductPreviewDTO[];

  missingCategories: string[];

  alreadyCapturedCount?: number;
}
export interface FileImportPreviewDTO {
  fileName: string;
  date: string;
  ticketCount: number;
  totalAmount: number;
}
export interface NewProductPreviewDTO {
  barcode: string;

  suggestedName: string;

  suggestedCategoryId: number | null;

  suggestedUnitId: number;

  totalQuantity: number;

  totalAmount: number;
}
export interface ConfirmSalesImportRequestDTO {
  previewId: number;

  newProducts: {
    barcode: string;
    name: string;
    categoryId: number | null;
    unitId: number;
  }[];

  confirmedMissingCategories?: boolean;
}
