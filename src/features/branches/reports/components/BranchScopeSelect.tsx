import { Button, Checkbox, Dropdown, DropdownItem } from "flowbite-react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import type { Branch } from "@/features/branches/branch/types";

interface Props {
  branches: Branch[];
  selected: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

export const BranchScopeSelect = ({
  branches,
  selected,
  onChange,
  disabled,
}: Props) => {
  const allSelected = selected.length === 0;
  const label = allSelected
    ? "Todas las sucursales"
    : selected.length === 1
      ? (branches.find((branch) => branch.id === selected[0])?.name ??
        "1 sucursal")
      : `${selected.length} sucursales`;

  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((value) => value !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <Dropdown
      color="gray"
      dismissOnClick={false}
      disabled={disabled}
      renderTrigger={() => (
        <Button color="gray" size="sm" disabled={disabled}>
          <HiOutlineOfficeBuilding className="mr-2 h-4 w-4" />
          {label}
        </Button>
      )}
    >
      <DropdownItem
        className="flex items-center gap-2"
        onClick={() => onChange([])}
      >
        <Checkbox
          checked={allSelected}
          onChange={() => onChange([])}
          onClick={(event) => event.stopPropagation()}
        />
        <span>Todas las sucursales</span>
      </DropdownItem>
      <div className="my-1 h-px bg-gray-600" />
      {branches.map((branch) => (
        <DropdownItem
          key={branch.id}
          className="flex items-center gap-2"
          onClick={() => toggle(branch.id)}
        >
          <Checkbox
            checked={selected.includes(branch.id)}
            onChange={() => toggle(branch.id)}
            onClick={(event) => event.stopPropagation()}
          />
          <span>{branch.name}</span>
        </DropdownItem>
      ))}
    </Dropdown>
  );
};
