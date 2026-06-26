import { EntityMultiSelect } from "./EntityMultiSelect";
import type { Branch } from "@/features/branches/branch/types";

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
  return (
    <EntityMultiSelect<Branch>
      items={branches}
      selected={selected}
      onChange={onChange}
      label="Sucursales"
      placeholder="Seleccionar sucursales"
    />
  );
}
