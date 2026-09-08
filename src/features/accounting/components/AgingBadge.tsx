import { Badge } from "flowbite-react";
import {
  AGING_BUCKET_LABEL,
  getAgingBucket,
  getAgingDays,
} from "../utils/aging";

export const AgingBadge = ({ isoDate }: { isoDate: string }) => {
  const days = getAgingDays(isoDate);
  const bucket = getAgingBucket(days);
  const color =
    bucket === "0-7"
      ? "success"
      : bucket === "8-14"
        ? "warning"
        : bucket === "15-30"
          ? "yellow"
          : "failure";
  return (
    <span className="inline-flex items-center gap-1">
      <Badge color={color}>{AGING_BUCKET_LABEL[bucket]}</Badge>
      <span className="text-[11px] text-gray-400">{days}d</span>
    </span>
  );
};
