import { UNIT_CONFIG } from "../../config/unitConfig";
import type { BatchResponseDTO } from "../../types.batch";
import { BaseBatchOverview } from "../BaseBatchOverview";

export const ChickenBatchOverview: React.FC<{ batch: BatchResponseDTO }> = ({
  batch,
}) => {
  // Obtenemos la configuración de Pollo Vivo
  const config = UNIT_CONFIG["LIVE_CHICKEN"];

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
