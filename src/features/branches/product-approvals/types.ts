export interface PendingProductDTO {
  barcode: string;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  unitId: number | null;
  unitName: string | null;
  reportedBranchId: number | null;
  reportedBranchName: string | null;
  createdAt: string | null;
  saleCount: number;
  totalQuantity: number;
  totalAmount: number;
}

export interface ApproveProductPayload {
  name?: string;
  categoryId?: number;
  unitId?: number;
}

export interface BranchApiKeyDTO {
  id: number;
  branchId: number;
  branchName: string;
  label: string | null;
  active: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreatedApiKeyDTO {
  id: number;
  plaintextKey: string;
}