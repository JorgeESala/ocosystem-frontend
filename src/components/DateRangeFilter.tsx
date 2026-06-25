import DateRangePicker from "./DateRangePicker";
import { formatUiDate } from "@/utils/date.utils";

export interface DateRange {
  start: Date;
  end: Date;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  defaultRange: DateRange;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isDefaultRange = (range: DateRange, defaultRange: DateRange) =>
  isSameDay(range.start, defaultRange.start) &&
  isSameDay(range.end, defaultRange.end);

export function DateRangeFilter({ value, onChange, defaultRange }: Props) {
  const handleChange = (start: Date | null, end: Date | null) => {
    if (start && end) {
      onChange({ start, end });
    }
  };

  const handleReset = () => {
    onChange(defaultRange);
  };

  const isModified = !isDefaultRange(value, defaultRange);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-wider text-gray-400 uppercase">
          Rango de fechas
        </span>
        <DateRangePicker
          startDate={value.start}
          endDate={value.end}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col items-start gap-1 pb-1">
        <span className="text-[10px] text-gray-500 italic">
          {formatUiDate(value.start, "short")} → {formatUiDate(value.end, "short")}
        </span>
        {isModified && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-blue-400 hover:underline"
          >
            Restablecer (últimos 30 días)
          </button>
        )}
      </div>
    </div>
  );
}

export default DateRangeFilter;
