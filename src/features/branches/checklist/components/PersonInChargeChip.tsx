import { Tooltip } from "flowbite-react";
import { HiUserCircle, HiExclamationCircle } from "react-icons/hi";
import type { PersonInCharge } from "../types/checklist.types";

interface PersonInChargeChipProps {
  person: PersonInCharge | null | undefined;
  className?: string;
}

export default function PersonInChargeChip({
  person,
  className = "",
}: PersonInChargeChipProps) {
  if (!person || !person.name) {
    return (
      <Tooltip
        content="No hay un encargado identificable en el periodo"
        placement="top"
      >
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-slate-700/50 ${className}`}
        >
          <HiExclamationCircle aria-hidden className="text-sm" />
          Sin encargado
        </span>
      </Tooltip>
    );
  }

  const tooltip =
    person.daysAsInCharge != null
      ? `Encargado durante ${person.daysAsInCharge} día${
          person.daysAsInCharge === 1 ? "" : "s"
        } del periodo`
      : "Encargado del periodo";

  return (
    <Tooltip content={tooltip} placement="top">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-200 ring-1 ring-slate-700/60 ${className}`}
      >
        <HiUserCircle aria-hidden className="text-sm text-slate-400" />
        <span className="max-w-[10rem] truncate">{person.name}</span>
        {person.daysAsInCharge != null && (
          <span className="text-[10px] text-slate-500">
            {person.daysAsInCharge} d
          </span>
        )}
      </span>
    </Tooltip>
  );
}
