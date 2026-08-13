import { HiOutlineExternalLink } from "react-icons/hi";
import type { AccountsPayableSourceType } from "../../live-chicken/accounting/accounts-payable/types";

interface Props {
  sourceType?: AccountsPayableSourceType;
  sourceBatchId?: number;
  sourceId?: number;
  onOpenSource: (batchId: number, saleId?: number) => void;
}

const sourceConfig: Record<
  AccountsPayableSourceType,
  { color: string; hoverColor: string }
> = {
  BATCH: {
    color: "bg-amber-900/50 text-amber-300 border border-amber-700/50",
    hoverColor: "hover:bg-amber-800/50 hover:text-amber-200",
  },
  DELIVERY: {
    color: "bg-blue-900/50 text-blue-300 border border-blue-700/50",
    hoverColor: "hover:bg-blue-800/50 hover:text-blue-200",
  },
  ADJUSTMENT: {
    color: "bg-gray-700/50 text-gray-400 border border-gray-600/50",
    hoverColor: "",
  },
  OTHER: {
    color: "bg-gray-700/50 text-gray-400 border border-gray-600/50",
    hoverColor: "",
  },
};

export const SourceBadge = ({
  sourceType,
  sourceBatchId,
  sourceId,
  onOpenSource,
}: Props) => {
  if (!sourceType) return null;

  const config = sourceConfig[sourceType];
  const isClickable =
    (sourceType === "BATCH" || sourceType === "DELIVERY") &&
    sourceBatchId != null;

  if (!isClickable) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${config.color}`}
      >
        {sourceType === "ADJUSTMENT" ? "Ajuste manual" : "Otro"}
      </span>
    );
  }

  const label =
    sourceType === "DELIVERY"
      ? `Venta de remesa #${sourceBatchId}`
      : `Remesa #${sourceBatchId}`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenSource(
          sourceBatchId!,
          sourceType === "DELIVERY" ? sourceId : undefined,
        );
      }}
      className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${config.color} ${config.hoverColor}`}
    >
      {label}
      <HiOutlineExternalLink className="h-3 w-3" />
    </button>
  );
};
