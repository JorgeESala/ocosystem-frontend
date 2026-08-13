import {
  scoreToTone,
  TONE_BAR_CLASSES,
  type ScoreTone,
} from "../utils/performance-color";

interface PerformanceBarProps {
  value: number | null | undefined;
  tone?: ScoreTone;
  showValue?: boolean;
  className?: string;
}

export default function PerformanceBar({
  value,
  tone,
  showValue = false,
  className = "",
}: PerformanceBarProps) {
  const resolvedTone = tone ?? scoreToTone(value);
  const v =
    value == null || Number.isNaN(value)
      ? 0
      : Math.max(0, Math.min(100, value));
  const colorClass = TONE_BAR_CLASSES[resolvedTone];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800/80">
        <div
          className={`h-full rounded-full ${colorClass} transition-all`}
          style={{ width: `${v}%` }}
        />
      </div>
      {showValue && (
        <span className="min-w-[3.5rem] text-right text-xs font-semibold text-slate-300 tabular-nums">
          {value == null ? "—" : `${Math.round(value)}%`}
        </span>
      )}
    </div>
  );
}
