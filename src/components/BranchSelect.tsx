import { useBranches } from "@/features/branches/branch/branch.queries";
import { Select } from "flowbite-react";
interface BranchSelectProps {
  value: number | "";
  onChange: (value: number | "") => void;
}
export const BranchSelect = ({ value, onChange }: BranchSelectProps) => {
  const { data: branches, isLoading } = useBranches();

  return (
    <Select
      id="branch-select"
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        // Si selecciona el placeholder, mandamos cadena vacía para que 'enabled' lo detecte
        onChange(val === "" ? "" : Number(val));
      }}
      disabled={isLoading}
      className="w-48"
    >
      <option value="">Selecciona sucursal...</option>
      {!isLoading &&
        branches?.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
    </Select>
  );
};
