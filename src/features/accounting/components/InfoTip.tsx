import type { ReactNode } from "react";
import { HiInformationCircle } from "react-icons/hi";

interface Props {
  title: string;
  children: ReactNode;
  align?: "left" | "center" | "right";
}

const alignmentClasses = {
  left: "left-0",
  center: "left-1/2 -translate-x-1/2",
  right: "right-0",
} as const;

export const InfoTip = ({ title, children, align = "center" }: Props) => (
  <span className="group relative inline-flex items-center">
    <HiInformationCircle
      className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-blue-400"
      aria-label={title}
    />
    <span
      className={`absolute top-full z-50 mt-1 hidden w-72 rounded-lg border border-gray-800 bg-gray-950 p-3 text-left text-[11px] leading-relaxed font-normal text-gray-300 normal-case shadow-xl group-hover:block ${alignmentClasses[align]}`}
    >
      <span className="mb-1 block border-b border-gray-800 pb-1 font-semibold text-white">
        {title}
      </span>
      <span className="block space-y-1.5">{children}</span>
    </span>
  </span>
);
