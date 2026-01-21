import type { BusinessType } from "@/business/business.types";

export const businessSlugMap: Record<string, BusinessType> = {
  sucursales: "BRANCHES",
  "pollo-vivo": "LIVE_CHICKEN",
  cerdo: "PIG",
  huevo: "EGG",
  verduras: "VEGETABLES",
  abarrotes: "GROCERIES",
};
