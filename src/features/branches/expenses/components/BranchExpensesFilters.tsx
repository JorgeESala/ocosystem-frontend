import { Button, Datepicker, Label, TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import FilterChipGroup from "@/features/expenses/components/FilterChipGroup";
import type { FilterChipOption } from "@/features/expenses/config/filterConfig";
import type { Branch } from "@/features/branches/branch/types";
import type { BranchCategoryDTO, ExpenseCategoryDTO } from "../types";

interface BranchExpensesFiltersProps {
  branches: Branch[];
  selectedBranchIds: number[];
  onSelectedBranchIdsChange: (ids: number[]) => void;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  expenseCategories: ExpenseCategoryDTO[];
  businessCategories: BranchCategoryDTO[];
  selectedCategoryIds: number[];
  onSelectedCategoryIdsChange: (ids: number[]) => void;
  selectedBusinessUnitIds: number[];
  onSelectedBusinessUnitIdsChange: (ids: number[]) => void;
  motivoSearch: string;
  onMotivoSearchChange: (value: string) => void;
  onClear: () => void;
}

const CATEGORY_COLORS = ["blue", "green", "orange", "purple", "cyan", "pink"];
const UNIT_COLORS = ["indigo", "yellow", "teal", "red"];

export default function BranchExpensesFilters({
  branches,
  selectedBranchIds,
  onSelectedBranchIdsChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  expenseCategories,
  businessCategories,
  selectedCategoryIds,
  onSelectedCategoryIdsChange,
  selectedBusinessUnitIds,
  onSelectedBusinessUnitIdsChange,
  motivoSearch,
  onMotivoSearchChange,
  onClear,
}: BranchExpensesFiltersProps) {
  const categoryOptions: FilterChipOption[] = expenseCategories.map(
    (category, index) => ({
      value: String(category.id),
      label: category.name,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }),
  );

  const businessUnitOptions: FilterChipOption[] = businessCategories.map(
    (category, index) => ({
      value: String(category.id),
      label: category.name,
      color: UNIT_COLORS[index % UNIT_COLORS.length],
    }),
  );

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Filtros
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Sucursales, periodo y conceptos
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Los filtros se aplican automáticamente. Sin sucursales seleccionadas
          se muestran todas.
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {categoryOptions.length > 0 && (
          <FilterChipGroup
            label="Tipo de gasto"
            options={categoryOptions}
            selected={selectedCategoryIds.map(String)}
            onChange={(values) =>
              onSelectedCategoryIdsChange(values.map(Number))
            }
          />
        )}
        {businessUnitOptions.length > 0 && (
          <FilterChipGroup
            label="Unidad de negocio"
            options={businessUnitOptions}
            selected={selectedBusinessUnitIds.map(String)}
            onChange={(values) =>
              onSelectedBusinessUnitIdsChange(values.map(Number))
            }
          />
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:w-80">
          <Label htmlFor="motivo-search">Motivo</Label>
          <TextInput
            id="motivo-search"
            icon={HiSearch}
            placeholder="Ej. plumas"
            value={motivoSearch}
            onChange={(e) => onMotivoSearchChange(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClear}>
            Limpiar
          </Button>
        </div>
      </div>
    </section>
  );
}
