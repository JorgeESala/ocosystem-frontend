import { useEffect, useMemo, useRef, useState } from "react";
import { HiChevronDown, HiX } from "react-icons/hi";

interface Props<T> {
  items: T[];
  selected: T | null;
  onChange: (item: T | null) => void;
  getValue: (item: T) => number;
  getLabel: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getDisabled?: (item: T) => boolean;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  inputId?: string;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function SearchableSelect<T>({
  items,
  selected,
  onChange,
  getValue,
  getLabel,
  getSubtitle,
  getDisabled,
  placeholder = "Buscar...",
  emptyMessage = "No se encontraron coincidencias",
  disabled = false,
  inputId,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const q = normalize(searchTerm.trim());
    return items.filter((item) => normalize(getLabel(item)).includes(q));
  }, [items, searchTerm, getLabel]);

  const handleSelect = (item: T) => {
    onChange(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          id={inputId}
          onClick={() => !disabled && setIsOpen((v) => !v)}
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-cyan-500"
        >
          <span className="flex-1 truncate">
            {selected ? (
              <span>
                <span className="font-medium">{getLabel(selected)}</span>
                {getSubtitle && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {getSubtitle(selected)}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                {placeholder}
              </span>
            )}
          </span>
          {selected && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-2 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-200"
              aria-label="Limpiar selección"
            >
              <HiX className="h-4 w-4" />
            </button>
          )}
          <HiChevronDown
            className={`ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute right-0 left-0 z-50 mt-1 rounded-lg border border-gray-300 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-2 dark:border-gray-700">
            <input
              autoFocus
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-500"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-gray-500 italic dark:text-gray-400">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((item) => {
                const isSelected =
                  selected && getValue(selected) === getValue(item);
                const isDisabled = getDisabled?.(item) ?? false;
                return (
                  <li
                    key={getValue(item)}
                    onClick={() => !isDisabled && handleSelect(item)}
                    className={`flex cursor-pointer flex-col gap-0.5 px-3 py-2 text-sm ${
                      isDisabled
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    } ${isSelected ? "bg-cyan-50 dark:bg-cyan-900/30" : ""}`}
                  >
                    <span
                      className={`${
                        isSelected
                          ? "font-semibold text-cyan-700 dark:text-cyan-300"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {getLabel(item)}
                    </span>
                    {getSubtitle && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getSubtitle(item)}
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
