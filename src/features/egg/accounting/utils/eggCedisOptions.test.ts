import { describe, expect, it } from "vitest";
import { toEggCedisOptions } from "./eggCedisOptions";
import type { AccountingEntity } from "@/features/accounting/types/accounting-entity.types";

const entity = (
  id: number,
  entityType: AccountingEntity["entityType"],
  entityId: number,
  name: string,
): AccountingEntity => ({ id, entityType, entityId, name });

describe("toEggCedisOptions", () => {
  it("keeps only EGGCedis entities", () => {
    const options = toEggCedisOptions([
      entity(1, "EGGCEDIS", 1, "Felipe Carrillo puerto"),
      entity(2, "BRANCH", 10, "Sucursal Centro"),
      entity(3, "SUPPLIER", 7, "Proveedor X"),
      entity(4, "CEDIS", 2, "CEDIS Pollo"),
      entity(5, "EGGCEDIS", 3, "Chunhuhub"),
    ]);
    expect(options).toEqual([
      { id: 1, name: "Felipe Carrillo puerto" },
      { id: 3, name: "Chunhuhub" },
    ]);
  });

  it("returns empty when no egg cedis present", () => {
    expect(
      toEggCedisOptions([entity(9, "BRANCH", 11, "Sucursal Norte")]),
    ).toEqual([]);
  });
});
