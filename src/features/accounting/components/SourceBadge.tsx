import { Badge } from "flowbite-react";
import { HiOutlineExternalLink } from "react-icons/hi";
import type { AccountsPayableSourceType } from "../../live-chicken/accounting/accounts-payable/types";

interface Props {
  sourceType?: AccountsPayableSourceType;
  sourceBatchId?: number;
  sourceId?: number;
  onOpenBatch: (batchId: number) => void;
}

const sourceConfig: Record<
  AccountsPayableSourceType,
  { label: string; color: string; hoverColor: string; icon: boolean }
> = {
  BATCH: {
    label: "Remesa",
    color: "bg-amber-900/50 text-amber-300 border border-amber-700/50",
    hoverColor: "hover:bg-amber-800/50 hover:text-amber-200",
    icon: true,
  },
  DELIVERY: {
    label: "Venta",
    color: "bg-blue-900/50 text-blue-300 border border-blue-700/50",
    hoverColor: "hover:bg-blue-800/50 hover:text-blue-200",
    icon: true,
  },
  ADJUSTMENT: {
    label: "Ajuste manual",
    color: "bg-gray-700/50 text-gray-400 border border-gray-600/50",
    hoverColor: "",
    icon: false,
  },
  OTHER: {
    label: "Otro",
    color: "bg-gray-700/50 text-gray-400 border border-gray-600/50",
    hoverColor: "",
    icon: false,
  },
};

export const SourceBadge = ({
  sourceType,
  sourceBatchId,
  onOpenBatch,
}: Props) => {
  if (!sourceType) return null;

  const config = sourceConfig[sourceType];
  const isClickable =
    (sourceType === "BATCH" || sourceType === "DELIVERY") &&
    sourceBatchId != null;

  if (!isClickable) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenBatch(sourceBatchId!);
      }}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer ${config.color} ${config.hoverColor}`}
    >
      {config.label} #{sourceBatchId}
      <HiOutlineExternalLink className="h-3 w-3" />
    </button>
  );
};
