import { Tooltip as FlowbiteTooltip } from "flowbite-react";
import type { ComponentProps } from "react";

const TOOLTIP_THEME = {
  target: "w-fit",
  animation: "transition-opacity",
  arrow: {
    base: "absolute z-[1000] h-2 w-2 rotate-45",
    style: {
      dark: "bg-gray-900 dark:bg-gray-700",
      light: "bg-white",
      auto: "bg-white dark:bg-gray-700",
    },
    placement: "-4px",
  },
  base: "absolute z-[1000] inline-block rounded-lg px-3 py-2 text-sm font-medium shadow-sm",
  hidden: "invisible opacity-0",
  style: {
    dark: "bg-gray-900 text-white dark:bg-gray-700",
    light: "border border-gray-200 bg-white text-gray-900",
    auto: "border border-gray-200 bg-white text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
  },
  content: "relative z-20",
};

export default function Tooltip(
  props: ComponentProps<typeof FlowbiteTooltip>,
) {
  return <FlowbiteTooltip theme={TOOLTIP_THEME} {...props} />;
}
