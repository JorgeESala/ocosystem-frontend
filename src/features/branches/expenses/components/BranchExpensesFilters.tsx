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

  const hasChips = categoryOptions.length > 0 || businessUnitOptions.length > 0;

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/95 p-4 shadow-lg lg:sticky lg:top-0 lg:z-30 lg:backdrop-blur">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_150px_150px_minmax(180px,240px)_auto] lg:items-end">
        <BranchMultiSelect
          branches={branches}
          selected={selectedBranchIds}
          onChange={onSelectedBranchIdsChange}
        />

        <div>
          <Label className="text-xs">Inicio</Label>
          <Datepicker
            language="es-MX"
            value={startDate}
            onChange={onStartDateChange}
          />
        </div>

        <div>
          <Label className="text-xs">Fin</Label>
          <Datepicker
            language="es-MX"
            value={endDate}
            onChange={onEndDateChange}
            minDate={startDate ?? undefined}
          />
        </div>

        <div>
          <Label className="text-xs" htmlFor="motivo-search">
            Motivo
          </Label>
          <TextInput
            id="motivo-search"
            icon={HiSearch}
            placeholder="Ej. plumas"
            value={motivoSearch}
            onChange={(e) => onMotivoSearchChange(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button color="gray" size="sm" onClick={onClear}>
            Limpiar
          </Button>
        </div>
      </div>

      {hasChips && (
        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-800 pt-3">
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
      )}
    </section>
  );
}
