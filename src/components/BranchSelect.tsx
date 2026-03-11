import { useBranches } from "@/context/BranchContext";
import { Select } from "flowbite-react";
interface BranchSelectProps {
  value: number | "";
  onChange: (value: number | "") => void;
}
export const BranchSelect = ({ value, onChange }: BranchSelectProps) => {
  const { branches, loading } = useBranches();

  return (
    <Select
      id="branch-select"
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        // Si selecciona el placeholder, mandamos cadena vacía para que 'enabled' lo detecte
        onChange(val === "" ? "" : Number(val));
      }}
      disabled={loading}
      className="w-48"
    >
      <option value="">Selecciona sucursal...</option>
      {!loading &&
        branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
    </Select>
  );
};
