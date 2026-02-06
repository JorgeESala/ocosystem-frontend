export type AccountingEntityType = "BRANCH" | "CEDIS" | "SUPPLIER";

export interface AccountingEntity {
  id: number; // ID del AccountingEntity
  name: string;
  entityType: AccountingEntityType;
  entityId: number; // ID original (branchId, supplierId, etc.)
}
