import { Dropdown, Checkbox, Label, Badge, DropdownItem } from "flowbite-react";

interface Props<T> {
  items: T[];
  selected: number[];
  onChange: (ids: number[]) => void;
  label: string;
  placeholder?: string;
  getValue?: (item: T) => number;
  getLabel?: (item: T) => string;
}

export function EntityMultiSelect<T extends { id: number; name: string }>({
  items,
  selected,
  onChange,
  label,
  placeholder = "Seleccionar",
  getValue = (item: T) => item.id,
  getLabel = (item: T) => item.name,
}: Props<T>) {
  const toggleItem = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const toggleAll = () => {
    if (selected.length === items.length) {
      onChange([]);
    } else {
      onChange(items.map(getValue));
    }
  };

  return (
    <div className="space-y-2 text-white">
      <Label>{label}</Label>

      <div className="flex flex-wrap gap-2">
        {selected.length === 0 ? (
          <span className="text-gray-400">Ninguna seleccionada</span>
        ) : (
          items
            .filter((item) => selected.includes(getValue(item)))
            .map((item) => (
              <Badge key={getValue(item)} color="info" className="px-2 py-1">
                {getLabel(item)}
              </Badge>
            ))
        )}
      </div>

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
              {placeholder}
            </button>
          )}
        >
          <div
            className="flex items-center gap-2 border-b border-gray-600 px-3 py-2"
            onClick={toggleAll}
          >
            <Checkbox
              checked={selected.length === items.length && items.length > 0}
              onChange={toggleAll}
            />
            <span className="text-sm">Seleccionar todas</span>
          </div>

          {items.map((item) => {
            const value = getValue(item);
            return (
              <DropdownItem
                key={value}
                className="flex cursor-pointer items-center gap-2"
                onClick={() => toggleItem(value)}
              >
                <Checkbox
                  checked={selected.includes(value)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleItem(value);
                  }}
                />
                <span>{getLabel(item)}</span>
              </DropdownItem>
            );
          })}
        </Dropdown>
      </div>
    </div>
  );
}

export default EntityMultiSelect;
