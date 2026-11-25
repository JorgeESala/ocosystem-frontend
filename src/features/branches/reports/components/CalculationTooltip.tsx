import type { ReactNode } from "react";
import { Tooltip } from "flowbite-react";
import {
  ExpectedCalculationContent,
  type ExpectedCalculationProps,
} from "./ExpectedCalculationContent";

interface Props extends ExpectedCalculationProps {
  children: ReactNode;
  triggerLabel?: string;
}

export const CalculationTooltip = ({
  children,
  triggerLabel = "Ver cálculo de la venta esperada",
  ...contentProps
}: Props) => (
  <Tooltip
    content={<ExpectedCalculationContent {...contentProps} />}
    placement="top"
  >
    <span
      className="cursor-help border-b border-dotted border-gray-500/70"
      tabIndex={0}
      aria-label={triggerLabel}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {children}
    </span>
  </Tooltip>
);
