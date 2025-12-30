import type { InboundBatch, InboundBatchSale } from "../../types";

export interface ChickenLoss {
  id: number;
  quantity: number;
  weight: number;
  lossAmount: number;
  batchId: number;
  date: Date;
}
export interface ChickenLossResponseDTO {
  id: number;
  quantity: number;
  weight: number;
  lossAmount: number;
  batchId: number;
  date: string;
}

export interface ChickenLossCreateDTO {
  quantity: number;
  weight: number;
  lossAmount: number;
  batchId: number;
  date: string;
}

export interface ChickenLossUpdateDTO {
  quantity: number;
  weight: number;
  lossAmount: number;
  batchId: number;
  date: string;
}
export interface ChickenLossFormValues {
  quantity: number;
  weight: number;
  lossAmount: number;
  date: Date;
}
export type EntryType = "SALE" | "LOSS";
export interface BatchEntryModalProps {
  batch: InboundBatch;
  type: EntryType;
  mode: "create" | "edit";
  saleToEdit?: InboundBatchSale;
  lossToEdit?: ChickenLoss;
  onClose: () => void;
  onSuccess: () => void;
}
