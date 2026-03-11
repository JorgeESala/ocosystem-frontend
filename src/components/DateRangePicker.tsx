import { Datepicker } from "flowbite-react";
import { useState } from "react";

interface DateRangePickerProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onChange?: (start: Date | null, end: Date | null) => void;
}

export default function DateRangePicker({
  startDate: initialStart,
  endDate: initialEnd,
  onChange,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(initialStart ?? null);
  const [endDate, setEndDate] = useState<Date | null>(initialEnd ?? null);

  const handleStartChange = (date: Date | null) => {
    setStartDate(date);
    // Si la fecha final es menor a la nueva fecha inicial, la reseteamos
    if (endDate && date && endDate < date) {
      setEndDate(null);
      onChange?.(date, null);
    } else {
      onChange?.(date, endDate);
    }
  };

  const handleEndChange = (date: Date | null) => {
    setEndDate(date);
    onChange?.(startDate, date);
  };

  return (
    <div className="flex gap-4">
      <Datepicker
        language="es-MX"
        labelTodayButton="Hoy"
        labelClearButton="Limpiar"
        value={startDate}
        onChange={handleStartChange}
      />

      <Datepicker
        language="es-MX"
        labelTodayButton="Hoy"
        labelClearButton="Limpiar"
        value={endDate}
        onChange={handleEndChange}
        minDate={startDate ?? undefined}
      />
    </div>
  );
}
