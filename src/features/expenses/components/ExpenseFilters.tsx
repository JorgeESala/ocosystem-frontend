import { Button, Datepicker, Label } from "flowbite-react";

interface ExpenseFiltersProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onSearch: () => void;
  onClear: () => void;
}

export default function ExpenseFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
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
            Rango de fechas
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Selecciona el periodo que quieres revisar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_160px_160px] lg:items-end">
        <div className="hidden lg:block" />
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

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-800 pt-4">
        <Button color="gray" onClick={onClear}>
          Limpiar
        </Button>
        <Button onClick={onSearch}>Buscar</Button>
      </div>
    </section>
  );
}