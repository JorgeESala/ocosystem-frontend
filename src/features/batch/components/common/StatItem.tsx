import React from "react";

interface StatItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  className,
}) => (
  <div className="flex flex-col border-r border-gray-700 pr-4 last:border-r-0">
    <span className="text-[10px] tracking-wider text-gray-500 uppercase">
      {label}
    </span>
    <span className={`font-medium ${className || "text-white"}`}>{value}</span>
  </div>
);
