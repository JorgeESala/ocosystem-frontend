import { describe, expect, it } from "vitest";
import { formatAccountingEntityLabel } from "./entityLabel";
import type { AccountingEntityType } from "@/features/accounting/types/accounting-entity.types";

const entity = (entityType: AccountingEntityType) => ({
  id: 1,
  name: "Prueba",
  entityType,
  entityId: 10,
});

describe("formatAccountingEntityLabel", () => {
  it("etiqueta a los clientes internos de huevo", () => {
    expect(formatAccountingEntityLabel(entity("EGGCLIENT"))).toBe(
      "Cliente interno - Prueba",
    );
  });

  it("mantiene las etiquetas existentes", () => {
    expect(formatAccountingEntityLabel(entity("BRANCH"))).toBe(
      "Sucursal - Prueba",
    );
    expect(formatAccountingEntityLabel(entity("EGGCEDIS"))).toBe(
      "Huevo - Prueba",
    );
  });
});
