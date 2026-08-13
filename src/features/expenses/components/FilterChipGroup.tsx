import { Badge } from "flowbite-react";
import type { FilterChipOption } from "../config/filterConfig";

interface FilterChipGroupProps {
  label: string;
  options: FilterChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function FilterChipGroup({
  label,
  options,
  selected,
  onChange,
}: FilterChipGroupProps) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className="transition-transform hover:scale-105"
            >
              <Badge
                color={isSelected ? (option.color as any) : "gray"}
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium select-none ${
                  isSelected
                    ? "ring-1 ring-white/20"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                {option.label}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
