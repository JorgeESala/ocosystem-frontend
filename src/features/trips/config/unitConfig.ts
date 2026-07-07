import type { TripsUnitType } from "../types/trip.types";

export interface TripUnitConfig {
  label: string;
  description: string;
  weightUnit: "kg" | "kg-pieza";
}

export const TRIP_UNIT_CONFIG: Record<TripsUnitType, TripUnitConfig> = {
  LIVE_CHICKEN: {
    label: "Pollo Vivo",
    description:
      "Despachos por ruta. Captura el peso inicial del camión y compara con lo entregado para ver la merma en tránsito.",
    weightUnit: "kg",
  },
  EGG: {
    label: "Huevo",
    description:
      "Despachos por ruta. Permite agrupar las ventas de un mismo chofer, ruta y día en un único registro.",
    weightUnit: "kg",
  },
};
