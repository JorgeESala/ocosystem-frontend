import React from "react";

interface StatItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  helpIcon?: React.ReactNode;
}

export const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  className,
  helpIcon,
}) => (
  <div className="flex flex-col border-r border-gray-700 pr-4 last:border-r-0">
    <span className="flex items-center gap-1 text-[10px] tracking-wider text-gray-500 uppercase">
      {label}
      {helpIcon}
    </span>
    <span className={`font-medium ${className || "text-white"}`}>{value}</span>
  </div>
);
