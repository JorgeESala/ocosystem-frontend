import type { AccountingEntity } from "../../../../accounting/types/accounting-entity.types";

export const formatAccountingEntityLabel = (entity: AccountingEntity) => {
  return `${ACCOUNTING_ENTITY_TYPE_LABEL[entity.entityType]} - ${entity.name}`;
};
export const ACCOUNTING_ENTITY_TYPE_LABEL: Record<string, string> = {
  BRANCH: "Sucursal",
  CEDIS: "CEDIS",
  SUPPLIER: "Proveedor",
};
