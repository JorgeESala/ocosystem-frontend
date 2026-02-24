// src/components/reports/BranchSelector.tsx

import { Select, Label } from "flowbite-react";
import { useQuery } from "@tanstack/react-query";
import { fetchBranches } from "@/services/api";

interface Props {
  value?: number;
  onChange: (value: number) => void;
}

export const BranchSelector = ({ value, onChange }: Props) => {
  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

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
        {branches?.map((branch: any) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </Select>
    </div>
  );
};
