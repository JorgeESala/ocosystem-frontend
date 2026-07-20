import type { CashFlowFrequency } from "../types";

interface Props {
  value: CashFlowFrequency;
  onChange: (f: CashFlowFrequency) => void;
}

const options: { label: string; value: CashFlowFrequency }[] = [
  { label: "Diario", value: "daily" },
  { label: "Semanal", value: "weekly" },
  { label: "Mensual", value: "monthly" },
];

export default function FrequencyToggle({ value, onChange }: Props) {
  return (
    <div className="flex rounded-lg bg-slate-700 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
