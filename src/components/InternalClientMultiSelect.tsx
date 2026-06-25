import { EntityMultiSelect } from "./EntityMultiSelect";
import type { Client } from "@/core/api/types";

interface Props {
  clients: Client[];
  selected: number[];
  onChange: (ids: number[]) => void;
  label?: string;
}

export function InternalClientMultiSelect({
  clients,
  selected,
  onChange,
  label = "Clientes internos",
}: Props) {
  return (
    <EntityMultiSelect<Client>
      items={clients}
      selected={selected}
      onChange={onChange}
      label={label}
      placeholder="Seleccionar clientes internos"
      getValue={(c) => c.accountingEntityId ?? 0}
      getLabel={(c) => c.name}
    />
  );
}

export default InternalClientMultiSelect;
