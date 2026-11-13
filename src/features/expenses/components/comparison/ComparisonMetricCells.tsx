import { formatMXN } from "@/utils/moneyNumbers";
import {
  comparisonAmountVariationLabel,
  comparisonCountVariationLabel,
  formatSignedAmount,
  formatSignedCount,
} from "../../utils/expense-comparison";
import type { ComparisonMetricValues } from "../../utils/expense-comparison";

export default function ComparisonMetricCells(item: ComparisonMetricValues) {
  return (
    <>
      <td className="px-3 py-2.5 text-right text-slate-200">
        {item.currentCount.toLocaleString("es-MX")}
      </td>
      <td className="px-3 py-2.5 text-right text-slate-400">
        {item.previousCount.toLocaleString("es-MX")}
      </td>
      <td className="px-3 py-2.5 text-right text-slate-200">
        {formatSignedCount(item.countDifference)}
      </td>
      <td className="px-3 py-2.5 text-right text-slate-200">
        {comparisonCountVariationLabel(item)}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-slate-200">
        {formatMXN(item.currentAmount)}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-slate-400">
        {formatMXN(item.previousAmount)}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-slate-200">
        {formatSignedAmount(item.amountDifference)}
      </td>
      <td className="px-3 py-2.5 text-right text-slate-200">
        {comparisonAmountVariationLabel(item)}
      </td>
    </>
  );
}
