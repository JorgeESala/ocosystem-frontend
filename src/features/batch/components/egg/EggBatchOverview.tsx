import React from "react";
import type { BatchResponseDTO } from "../../types.batch";
import { BaseBatchOverview } from "../BaseBatchOverview";
import { UNIT_CONFIG } from "../../config/unitConfig";
export const EggBatchOverview: React.FC<{ batch: BatchResponseDTO }> = ({
  batch,
}) => {
  // Obtenemos la configuración de Huevo
  const config = UNIT_CONFIG["EGG"];

  return (
    <BaseBatchOverview
      batch={batch}
      // Inyectamos el Header que definimos anteriormente
      statsComponent={<config.HeaderStats batch={batch} />}
      // Inyectamos el Footer (esto quita el error de TypeScript)
      footerComponent={<config.FooterStats batch={batch} />}
    />
  );
};
