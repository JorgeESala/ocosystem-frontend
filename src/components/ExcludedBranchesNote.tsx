import { HiEyeOff } from "react-icons/hi";
import type { ExcludedBranch } from "@/features/branches/checklist/types/excluded-branch.types";

interface Props {
  excluded: ExcludedBranch[];
  className?: string;
}

export default function ExcludedBranchesNote({
  excluded,
  className = "",
}: Props) {
  if (excluded.length === 0) return null;

  const names = excluded.map(
    (item) => item.branchName ?? `Sucursal ${item.branchId}`,
  );
  const details = excluded
    .filter((item) => item.reason)
    .map(
      (item) =>
        `${item.branchName ?? `Sucursal ${item.branchId}`}: ${item.reason}`,
    )
    .join(" · ");

  return (
    <p
      className={`inline-flex items-center gap-1 text-xs text-gray-400 ${className}`}
      title={details || undefined}
    >
      <HiEyeOff className="h-3.5 w-3.5 flex-shrink-0" />
      <span>
        {excluded.length === 1
          ? "1 sucursal excluida del análisis"
          : `${excluded.length} sucursales excluidas del análisis`}
        {" · "}
        <span className="text-gray-500">{names.join(", ")}</span>
      </span>
    </p>
  );
}
