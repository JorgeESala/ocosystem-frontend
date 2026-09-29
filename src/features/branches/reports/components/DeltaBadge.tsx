import { HiArrowDown, HiArrowUp } from "react-icons/hi";

interface Props {
  value: number | null;
  invert?: boolean;
  className?: string;
  suffix?: string;
}

export const DeltaBadge = ({
  value,
  invert = false,
  className = "",
  suffix = "vs. periodo anterior",
}: Props) => {
  if (value == null) {
    return (
      <span className={`text-xs font-medium text-gray-500 ${className}`}>
        Sin comparativo
      </span>
    );
  }

  const isUp = value >= 0;
  const isGood = invert ? !isUp : isUp;
  const color = isGood ? "text-green-400" : "text-red-400";
  const Icon = isUp ? HiArrowUp : HiArrowDown;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${color} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}%
      <span className="font-normal text-gray-500">{suffix}</span>
    </span>
  );
};
