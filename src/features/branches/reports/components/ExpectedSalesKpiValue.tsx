import { formatMXNCompact } from "@/utils/moneyNumbers";
import type { ExpectedSalesSummaryDTO } from "../api/expectedSales.api";
import { formatMoney } from "../utils/expectedSales";
import { CalculationTooltip } from "./CalculationTooltip";

interface Props {
  summary?: ExpectedSalesSummaryDTO;
  branchName?: string;
  showCalculation?: boolean;
}

export const ExpectedSalesKpiValue = ({
  summary,
  branchName,
  showCalculation = false,
}: Props) => {
  const value =
    summary?.expectedMoney != null
      ? formatMXNCompact(summary.expectedMoney)
      : "—";

  if (
    !showCalculation ||
    !summary ||
    summary.expectedMoney == null ||
    summary.expectedKg == null
  ) {
    return <>{value}</>;
  }

  return (
    <CalculationTooltip
      scopeLabel={branchName}
      birdsSold={summary.birdsSold}
      avgChickenWeight={summary.avgChickenWeight}
      expectedKg={summary.expectedKg}
      pricePerKg={summary.effectivePricePerKg}
      expectedMoney={summary.expectedMoney}
      moneyLabel="Mínimo total"
      moneyNote="Suma de kg esperados × precio de cada día con precio de referencia; incluye días sin monto registrado."
      valueLabel={formatMoney(summary.expectedMoney)}
      wastePerChickenKg={summary.wastePerChickenKg}
      missingProduct={(summary.branchesWithoutReference ?? 0) > 0}
      missingPrice={(summary.daysWithoutPrice ?? 0) > 0}
      missingAmount={(summary.salesWithoutReportedMoney ?? 0) > 0}
    >
      {value}
    </CalculationTooltip>
  );
};
