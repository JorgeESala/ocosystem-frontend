import { Dropdown, Checkbox, Label, Badge, DropdownItem } from "flowbite-react";
import type { Branch } from "../services/api";

interface Props {
  branches: Branch[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export default function BranchMultiSelect({
  branches,
  selected,
  onChange,
}: Props) {
  const toggleBranch = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((b) => b !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const toggleAll = () => {
    if (selected.length === branches.length) {
      onChange([]);
    } else {
      onChange(branches.map((b) => b.id));
    }
  };

  return (
    <div className="space-y-2 text-white">
      <Label>Sucursales</Label>

      {/* Chips de sucursales seleccionadas */}
      <div className="flex flex-wrap gap-2">
        {selected.length === 0 ? (
          <span className="text-gray-400">Ninguna seleccionada</span>
        ) : (
          selected.map((id) => {
            const branch = branches.find((b) => b.id === id);
            return (
              <Badge key={id} color="info" className="px-2 py-1">
                {branch?.name}
              </Badge>
            );
          })
        )}
      </div>

      {/* Dropdown flowbite */}
      <div className="relative">
        <Dropdown
          placement="bottom-start"
          color="gray"
          dismissOnClick={false}
          className="absolute z-50 w-56"
          renderTrigger={() => (
            <button
              type="button"
              className="w-full rounded-lg bg-gray-700 px-4 py-2 text-left text-sm text-white"
            >
              Seleccionar sucursales
            </button>
          )}
        >
          {/* Seleccionar todas */}
          <div
            className="flex items-center gap-2 border-b border-gray-600 px-3 py-2"
            onClick={toggleAll}
          >
            <Checkbox
              checked={selected.length === branches.length}
              onChange={toggleAll}
            />
            <span className="text-sm">Seleccionar todas</span>
          </div>

          {/* Lista de sucursales */}
          {branches.map((b) => (
            <DropdownItem
              key={b.id}
              className="flex cursor-pointer items-center gap-2"
              onClick={() => toggleBranch(b.id)}
            >
              <Checkbox
                checked={selected.includes(b.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleBranch(b.id);
                }}
              />
              <span>{b.name}</span>
            </DropdownItem>
          ))}
        </Dropdown>
      </div>
    </div>
  );
}
