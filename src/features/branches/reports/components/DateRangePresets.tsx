import { Button } from "flowbite-react";

interface Props {
  onSelect: (start: Date, end: Date) => void;
  className?: string;
}

const PRESETS = [
  { label: "Hoy", days: 1 },
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

export const DateRangePresets = ({ onSelect, className = "" }: Props) => {
  const selectPreset = (days: number) => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
    onSelect(start, end);
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1 ${className}`}
      data-testid="date-range-presets"
    >
      {PRESETS.map((preset) => (
        <Button
          key={preset.label}
          size="xs"
          color="gray"
          onClick={() => selectPreset(preset.days)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
};
