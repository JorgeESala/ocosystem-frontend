import type { ComponentProps } from "react";
import { RangeSlider } from "flowbite-react";

type RangeSliderProps = Omit<ComponentProps<typeof RangeSlider>, "onChange"> & {
  onChange: (value: number) => void;
};

export function NumberRangeSlider({ onChange, ...props }: RangeSliderProps) {
  return (
    <RangeSlider
      {...props}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
