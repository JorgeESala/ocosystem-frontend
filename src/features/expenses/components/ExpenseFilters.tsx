import { Button, Datepicker, Label } from "flowbite-react";
import FilterChipGroup from "./FilterChipGroup";
import {
  CATEGORY_CHIP_OPTIONS,
  EXPENSE_TYPE_CHIP_OPTIONS,
} from "../config/filterConfig";
import type { ExpenseCategoryCode, ExpenseType } from "@/core/api/types";

interface ExpenseFiltersProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  selectedCategoryCodes: ExpenseCategoryCode[];
  onCategoryCodesChange: (codes: ExpenseCategoryCode[]) => void;
  selectedExpenseTypes: ExpenseType[];
  onExpenseTypesChange: (types: ExpenseType[]) => void;
  onSearch: () => void;
  onClear: () => void;
}

export default function ExpenseFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedCategoryCodes,
  onCategoryCodesChange,
  selectedExpenseTypes,
  onExpenseTypesChange,
  onSearch,
  onClear,
}: ExpenseFiltersProps) {
  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Filtros
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Filtros de gastos
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Selecciona gastos, categorias y rango de fechas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FilterChipGroup
          label="Gasto"
          options={CATEGORY_CHIP_OPTIONS}
          selected={selectedCategoryCodes}
          onChange={(values) =>
            onCategoryCodesChange(values as ExpenseCategoryCode[])
          }
        />
        <FilterChipGroup
          label="Categoria"
          options={EXPENSE_TYPE_CHIP_OPTIONS}
          selected={selectedExpenseTypes}
          onChange={(values) => onExpenseTypesChange(values as ExpenseType[])}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
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
        <div className="flex flex-1 justify-end gap-2 sm:ml-auto">
          <Button color="gray" onClick={onClear}>
            Limpiar
          </Button>
          <Button onClick={onSearch}>Buscar</Button>
        </div>
      </div>
    </section>
  );
}