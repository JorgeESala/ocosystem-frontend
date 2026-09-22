import React from "react";
import { Datepicker, Label } from "flowbite-react";

interface DateRangeFieldsProps {
  from: Date | null;
  to: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
}

export const DateRangeFields: React.FC<DateRangeFieldsProps> = ({
  from,
  to,
  onChange,
}) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div>
      <Label>Desde</Label>
      <Datepicker
        language="es-MX"
        labelTodayButton="Hoy"
        labelClearButton="Limpiar"
        value={from}
        onChange={(date) => {
          if (date && to && to < date) {
            onChange(date, null);
          } else {
            onChange(date, to);
          }
        }}
      />
    </div>
    <div>
      <Label>Hasta</Label>
      <Datepicker
        language="es-MX"
        labelTodayButton="Hoy"
        labelClearButton="Limpiar"
        value={to}
        onChange={(date) => onChange(from, date)}
        minDate={from ?? undefined}
      />
    </div>
  </div>
);
