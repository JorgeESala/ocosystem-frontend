import React from "react";
import type { BatchResponseDTO } from "../../types.batch";
import { BaseBatchOverview } from "../BaseBatchOverview";
import { UNIT_CONFIG } from "../../config/unitConfig";
export const EggBatchOverview: React.FC<{
  batch: BatchResponseDTO;
  autoExpandId?: number | null;
}> = ({ batch, autoExpandId }) => {
  const config = UNIT_CONFIG["EGG"];

  return (
    <BaseBatchOverview
      batch={batch}
      statsComponent={<config.HeaderStats batch={batch} />}
      footerComponent={<config.FooterStats batch={batch} />}
      autoExpandId={autoExpandId}
    />
  );
};
