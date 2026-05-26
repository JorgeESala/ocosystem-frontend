import { Button, Datepicker, Label } from "flowbite-react";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import type { Branch } from "@/features/branches/branch/types";

interface BranchExpensesFiltersProps {
  branches: Branch[];
  selectedBranchIds: number[];
  onSelectedBranchIdsChange: (ids: number[]) => void;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onSearch: () => void;
  onClear: () => void;
}

export default function BranchExpensesFilters({
  branches,
  selectedBranchIds,
  onSelectedBranchIdsChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  onClear,
}: BranchExpensesFiltersProps) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_160px_160px] lg:items-end">
        <BranchMultiSelect
          branches={branches}
          selected={selectedBranchIds}
          onChange={onSelectedBranchIdsChange}
        />

        <div>
          <Label>Inicio</Label>
          <Datepicker
            language="es-MX"
            value={startDate}
            onChange={onStartDateChange}
          />
        </div>

        <div>
          <Label>Fin</Label>
          <Datepicker
            language="es-MX"
            value={endDate}
            onChange={onEndDateChange}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button color="gray" onClick={onClear}>
          Limpiar
        </Button>
        <Button onClick={onSearch}>Buscar</Button>
      </div>
    </section>
  );
}
