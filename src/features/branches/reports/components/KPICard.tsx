import type { KeyboardEvent, ReactNode } from "react";
import { Card } from "flowbite-react";
import type { IconType } from "react-icons";
import { DeltaBadge } from "./DeltaBadge";

type KpiColor =
  | "blue"
  | "purple"
  | "green"
  | "orange"
  | "yellow"
  | "pink"
  | "red";

interface KPICardProps {
  title: string;
  value: string;
  icon: IconType;
  color: KpiColor;
  delta?: number | null;
  deltaInvert?: boolean;
  footnote?: string;
  info?: ReactNode;
  onClick?: () => void;
  actionHint?: string;
}

const COLOR_CLASSES: Record<KpiColor, string> = {
  blue: "bg-blue-900/30 text-blue-400",
  purple: "bg-purple-900/30 text-purple-400",
  green: "bg-green-900/30 text-green-400",
  orange: "bg-orange-900/30 text-orange-400",
  yellow: "bg-yellow-900/30 text-yellow-400",
  pink: "bg-pink-900/30 text-pink-400",
  red: "bg-red-900/30 text-red-400",
};

export const KPICard = ({
  title,
  value,
  icon: Icon,
  color,
  delta,
  deltaInvert,
  footnote,
  info,
  onClick,
  actionHint,
}: KPICardProps) => {
  const clickable = Boolean(onClick);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={`border-none bg-gray-800 shadow-lg ${
        clickable
          ? "cursor-pointer transition-shadow focus-within:ring-1 focus-within:ring-blue-500/60 hover:ring-1 hover:ring-blue-500/60"
          : ""
      }`}
    >
      <div
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className="rounded-lg focus-visible:outline-none"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-1 text-sm font-medium tracking-wider text-gray-400 uppercase">
              {title}
              {info}
            </p>
            <p className="text-2xl font-bold tracking-tight text-white">
              {value}
            </p>
            {delta !== undefined && (
              <DeltaBadge
                value={delta}
                invert={deltaInvert}
                className="mt-1"
                suffix=""
              />
            )}
            {footnote && (
              <p className="mt-1 text-[11px] text-gray-500">{footnote}</p>
            )}
            {clickable && actionHint && (
              <p className="mt-1 text-[10px] font-semibold text-blue-400">
                {actionHint} →
              </p>
            )}
          </div>
          <div className={`rounded-xl p-3 ${COLOR_CLASSES[color]}`}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </div>
    </Card>
  );
};
