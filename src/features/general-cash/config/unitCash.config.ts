import type { UnitCashUnit } from "../types.unit";

export interface UnitCashConfig {
  label: string;
  scopeLabel: string;
  description: string;
}

export const UNIT_CASH_CONFIG: Record<UnitCashUnit, UnitCashConfig> = {
  EGG: {
    label: "Huevo",
    scopeLabel: "CEDIS",
    description:
      "Posicion de efectivo, flujo de caja y alertas del negocio de huevo.",
  },
  LIVE_CHICKEN: {
    label: "Pollo vivo",
    scopeLabel: "CEDIS",
    description:
      "Posicion de efectivo, flujo de caja y alertas del negocio de pollo vivo.",
  },
};
