import { EntityMultiSelect } from "./EntityMultiSelect";
import type { Supplier } from "@/core/api/types";

interface Props {
  suppliers: Supplier[];
  selected: number[];
  onChange: (ids: number[]) => void;
  label?: string;
}

export function SupplierMultiSelect({
  suppliers,
  selected,
  onChange,
  label = "Proveedores",
}: Props) {
  return (
    <EntityMultiSelect<Supplier>
      items={suppliers}
      selected={selected}
      onChange={onChange}
      label={label}
      placeholder="Seleccionar proveedores"
      getValue={(s) => s.id}
      getLabel={(s) => s.name}
    />
  );
}

export default SupplierMultiSelect;
