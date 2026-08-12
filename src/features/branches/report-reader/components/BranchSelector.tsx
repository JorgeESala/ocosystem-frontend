import { Select, Label } from "flowbite-react";
import { useBranches } from "@/features/branches/branch/branch.queries";

interface Props {
  value?: number;
  onChange: (value: number) => void;
}

export const BranchSelector = ({ value, onChange }: Props) => {
  const { data, isLoading } = useBranches();
  const branches = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-2">
      <Label htmlFor="branch">Sucursal</Label>
      <Select
        id="branch"
        value={value ?? ""}
        disabled={isLoading}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="">Selecciona una sucursal</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </Select>
    </div>
  );
};
