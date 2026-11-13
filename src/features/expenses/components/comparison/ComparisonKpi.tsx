import { HiArrowDown, HiArrowUp } from "react-icons/hi";

interface ComparisonKpiProps {
  title: string;
  value: string;
  hint: string;
  variation?: string;
  up?: boolean;
}

export default function ComparisonKpi({
  title,
  value,
  hint,
  variation,
  up,
}: ComparisonKpiProps) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
        {title}
      </p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{hint}</p>
      {variation && (
        <p
          className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
            up ? "text-red-300" : "text-emerald-300"
          }`}
        >
          {up ? (
            <HiArrowUp className="h-3 w-3" />
          ) : (
            <HiArrowDown className="h-3 w-3" />
          )}
          {variation}
        </p>
      )}
    </div>
  );
}
