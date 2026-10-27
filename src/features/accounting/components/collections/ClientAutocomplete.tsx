import { useEffect, useMemo, useRef, useState } from "react";
import { TextInput } from "flowbite-react";
import type { Client } from "@/core/api/types";

interface Props {
  clients: Client[];
  selected: Client | null;
  onSelect: (client: Client | null) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  resetKey?: number;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const displayName = (client: Client) =>
  client.name ?? client.businessName ?? "Cliente";

const clientSubtitle = (client: Client) => {
  const parts = [
    client.businessName && client.businessName !== client.name
      ? client.businessName
      : null,
    client.phone,
    client.localityName,
  ].filter(Boolean);
  return parts.join(" · ");
};

export const ClientAutocomplete = ({
  clients,
  selected,
  onSelect,
  inputRef,
  resetKey,
}: Props) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (resetKey === undefined) return;
    setQuery("");
    setOpen(false);
  }, [resetKey]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const creditClients = useMemo(
    () => clients.filter((client) => client.accountingEntityId != null),
    [clients],
  );

  const suggestions = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return creditClients.slice(0, 8);
    return creditClients
      .filter((client) => {
        const name = normalize(displayName(client));
        const business = client.businessName
          ? normalize(client.businessName)
          : "";
        return name.includes(term) || business.includes(term);
      })
      .slice(0, 8);
  }, [creditClients, query]);

  const handleSelect = (client: Client) => {
    setQuery(displayName(client));
    setOpen(false);
    onSelect(client);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    if (selected) {
      onSelect(null);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <TextInput
        ref={inputRef}
        id="collection-client"
        aria-label="Buscar cliente"
        placeholder="Buscar cliente por nombre o negocio"
        value={query}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && open && suggestions.length > 0) {
            event.preventDefault();
            handleSelect(suggestions[0]);
          }
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {selected && (
        <p className="mt-1 text-xs text-gray-500">
          {clientSubtitle(selected) || "Cliente con cuenta por cobrar"}
        </p>
      )}
      {open && (
        <div className="absolute right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
          {suggestions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">
              No hay coincidencias con cuenta por cobrar
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
              {suggestions.map((client) => (
                <li key={client.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected?.id === client.id}
                    className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-700"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(client)}
                  >
                    <span className="text-sm font-medium text-white">
                      {displayName(client)}
                    </span>
                    {clientSubtitle(client) && (
                      <span className="text-xs text-gray-400">
                        {clientSubtitle(client)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
