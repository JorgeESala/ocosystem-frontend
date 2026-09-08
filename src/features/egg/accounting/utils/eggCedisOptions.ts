import type { AccountingEntity } from "@/features/accounting/types/accounting-entity.types";

export interface EggCedisOption {
  id: number;
  name: string;
}

export const toEggCedisOptions = (
  entities: AccountingEntity[],
): EggCedisOption[] =>
  entities
    .filter((e) => e.entityType === "EGGCEDIS")
    .map((e) => ({
      id: e.entityId,
      name: e.name,
    }));
