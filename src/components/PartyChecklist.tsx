import { useMemo } from "react";
import { HiCheck } from "react-icons/hi";

interface Props<T> {
  items: T[];
  getPartyName: (item: T) => string;
  selectedParties: string[];
  onChange: (parties: string[]) => void;
  label: string;
}

export function PartyChecklist<T>({
  items,
  getPartyName,
  selectedParties,
  onChange,
  label,
}: Props<T>) {
  const parties = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      set.add(getPartyName(item));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items, getPartyName]);

  if (parties.length <= 1) return null;

  const toggle = (name: string) => {
    if (selectedParties.includes(name)) {
      onChange(selectedParties.filter((p) => p !== name));
    } else {
      onChange([...selectedParties, name]);
    }
  };

  const hasFilter = selectedParties.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="mb-1 flex items-center gap-2">
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
        {hasFilter && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="shrink-0 text-[10px] font-medium text-cyan-600 hover:underline dark:text-cyan-400"
          >
            Limpiar
          </button>
        )}
      </div>
      <div className="flex max-h-[120px] flex-wrap gap-1 overflow-y-auto">
        {parties.map((name) => {
          const isChecked = selectedParties.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
                isChecked
                  ? "bg-cyan-600 text-white hover:bg-cyan-700"
                  : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {isChecked && <HiCheck className="h-3 w-3" />}
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PartyChecklist;
