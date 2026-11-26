import type { ExpectedSalesSummaryDTO } from "../api/expectedSales.api";
import { formatKg } from "../utils/expectedSales";
import { CalculationTooltip } from "./CalculationTooltip";

interface Props {
  summary?: ExpectedSalesSummaryDTO;
  branchName?: string;
}

export const ExpectedSalesKpiValue = ({ summary, branchName }: Props) => {
  if (!summary || summary.expectedKg == null) {
    return <>{formatKg(summary?.expectedKg)}</>;
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
      valueLabel={formatKg(summary.expectedKg)}
      wastePerChickenKg={summary.wastePerChickenKg}
      missingProduct={(summary.branchesWithoutReference ?? 0) > 0}
      missingPrice={(summary.daysWithoutPrice ?? 0) > 0}
      missingAmount={(summary.salesWithoutReportedMoney ?? 0) > 0}
    >
      {formatKg(summary.expectedKg)}
    </CalculationTooltip>
  );
};
