export type AccountingEntityType = "BRANCH" | "CEDIS" | "SUPPLIER";

export interface AccountingEntity {
  id: number; // ID del AccountingEntity
  name: string;
  entityType: AccountingEntityType;
  entityId: number; // ID original (branchId, supplierId, etc.)
}
export interface CompensationPaymentAPRequest {
  branchCedisAccountsPayableId: number;
  cedisSupplierAccountsPayableId: number;
  amount: number;
  date: string; // ISO yyyy-mm-dd
  folio?: string;
  note?: string;
}

export interface CompensationPaymentResponse {
  id: number;
  amount: number;
  folio?: string;
}
