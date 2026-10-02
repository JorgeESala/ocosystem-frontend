import { DeltaBadge } from "@/features/branches/reports/components/DeltaBadge";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";

interface Props {
  value: number | null;
  current: number;
  previous: number | null;
  trimmedDays?: number;
  invert?: boolean;
  className?: string;
  suffix?: string;
}

export default function DeltaWithValues({
  value,
  current,
  previous,
  trimmedDays = 0,
  invert = false,
  className = "",
  suffix,
}: Props) {
  if (value == null || previous == null) {
    return <DeltaBadge value={value} invert={invert} className={className} />;
  }

  const detail =
    `Actual: ${formatMXN(current)} · Anterior: ${formatMXN(previous)}` +
    (trimmedDays > 0
      ? ` · Comparativa sin ${trimmedDays} día${trimmedDays === 1 ? "" : "s"}`
      : "");

  return (
    <span className="inline-flex items-center gap-1">
      <DeltaBadge
        value={value}
        invert={invert}
        className={className}
        suffix={suffix}
      />
      <InfoTip title="Valores comparados">{detail}</InfoTip>
    </span>
  );
}
