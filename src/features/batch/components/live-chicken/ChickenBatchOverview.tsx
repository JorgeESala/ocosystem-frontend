import { UNIT_CONFIG } from "../../config/unitConfig";
import type { BatchResponseDTO } from "../../types.batch";
import { BaseBatchOverview } from "../BaseBatchOverview";

export const ChickenBatchOverview: React.FC<{
  batch: BatchResponseDTO;
  autoExpandId?: number | null;
}> = ({ batch, autoExpandId }) => {
  const config = UNIT_CONFIG["LIVE_CHICKEN"];

  return (
    <BaseBatchOverview
      batch={batch}
      statsComponent={<config.HeaderStats batch={batch} />}
      footerComponent={<config.FooterStats batch={batch} />}
      autoExpandId={autoExpandId}
    />
  );
};
