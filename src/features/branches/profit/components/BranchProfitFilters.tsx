import { Button, Datepicker, Label } from "flowbite-react";
import { HiOutlineRefresh, HiSearch } from "react-icons/hi";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import type { Branch } from "@/features/branches/branch/types";

interface BranchProfitFiltersProps {
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

export default function BranchProfitFilters({
  branches,
  selectedBranchIds,
  onSelectedBranchIdsChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  onClear,
}: BranchProfitFiltersProps) {
  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Filtros
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Sucursales y rango de fechas
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Selecciona una o varias sucursales para revisar utilidad, costo de
          pollo y efectivo esperado.
        </p>
      </div>

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
            minDate={startDate ?? undefined}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-800 pt-4">
        <Button color="gray" onClick={onClear}>
          <HiOutlineRefresh className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
        <Button onClick={onSearch}>
          <HiSearch className="mr-2 h-4 w-4" />
          Generar reporte
        </Button>
      </div>
    </section>
  );
}

