import { useMemo, useState } from "react";
import { HiCheck, HiPencilAlt, HiSearch, HiX } from "react-icons/hi";

interface Props<T> {
  items: T[];
  selected: T | null;
  onChange: (item: T | null) => void;
  getValue: (item: T) => number;
  getLabel: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getSearchText?: (item: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  maxHeightClass?: string;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function AccountPicker<T>({
  items,
  selected,
  onChange,
  getValue,
  getLabel,
  getSubtitle,
  getSearchText,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No hay cuentas pendientes",
  loading = false,
  disabled = false,
  maxHeightClass = "max-h-[60vh]",
}: Props<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(searchTerm.trim());
    if (!q) return items;
    return items.filter((item) => {
      const haystack = getSearchText
        ? getSearchText(item)
        : `${getLabel(item)}${getSubtitle ? " " + getSubtitle(item) : ""}`;
      return normalize(haystack).includes(q);
    });
  }, [items, searchTerm, getLabel, getSubtitle, getSearchText]);

  const handleSelect = (item: T) => {
    if (disabled) return;
    onChange(item);
  };

  const handleClear = () => {
    if (disabled) return;
    onChange(null);
    setSearchTerm("");
  };

  if (selected) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 dark:border-cyan-700 dark:bg-cyan-900/30 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-cyan-500 bg-cyan-500 text-white">
          <HiCheck className="h-3 w-3" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-cyan-800 dark:text-cyan-200">
            {getLabel(selected)}
          </span>
          {getSubtitle && (
            <span className="block truncate text-xs text-cyan-700/80 dark:text-cyan-300/80">
              {getSubtitle(selected)}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-cyan-300 bg-white px-2 py-0.5 text-xs font-medium text-cyan-700 hover:bg-cyan-100 disabled:cursor-not-allowed dark:border-cyan-700 dark:bg-gray-800 dark:text-cyan-300 dark:hover:bg-gray-700"
        >
          <HiPencilAlt className="h-3.5 w-3.5" />
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className="border-b border-gray-200 px-2 py-1.5 dark:border-gray-700">
        <div className="relative">
          <HiSearch className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className="w-full rounded-md border border-gray-200 bg-white py-1 pl-7 pr-2 text-xs text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-200"
              aria-label="Limpiar búsqueda"
            >
              <HiX className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className={`overflow-y-auto ${maxHeightClass}`}>
        {loading ? (
          <div className="px-3 py-4 text-center text-xs italic text-gray-500 dark:text-gray-400">
            Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs italic text-gray-500 dark:text-gray-400">
            {searchTerm.trim() ? "Sin coincidencias" : emptyMessage}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((item) => (
              <li
                key={getValue(item)}
                onClick={() => handleSelect(item)}
                className="flex cursor-pointer items-start gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gray-300 dark:border-gray-500" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-gray-900 dark:text-gray-100">
                    {getLabel(item)}
                  </span>
                  {getSubtitle && (
                    <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                      {getSubtitle(item)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AccountPicker;
