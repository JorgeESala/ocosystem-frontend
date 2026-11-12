export interface ComparisonMetric {
  code: string;
  label: string;
  currentCount: number;
  previousCount: number;
  currentAmount: number;
  previousAmount: number;
  amountDifference: number;
  amountVariationPct: number | null;
  countDifference: number;
  countVariationPct: number | null;
  newInCurrent: boolean;
}

export interface ComparisonHighlights {
  topCountIncrease?: ComparisonMetric;
  topCountDecrease?: ComparisonMetric;
  topAmountIncrease?: ComparisonMetric;
  topAmountDecrease?: ComparisonMetric;
}

export const buildComparisonHighlights = (
  items: ComparisonMetric[],
): ComparisonHighlights => {
  const topCountIncrease = items.reduce<ComparisonMetric | undefined>(
    (best, item) =>
      item.countDifference > 0 &&
      (!best || item.countDifference > best.countDifference)
        ? item
        : best,
    undefined,
  );
  const topCountDecrease = items.reduce<ComparisonMetric | undefined>(
    (best, item) =>
      item.countDifference < 0 &&
      (!best || item.countDifference < best.countDifference)
        ? item
        : best,
    undefined,
  );
  const topAmountIncrease = items.reduce<ComparisonMetric | undefined>(
    (best, item) =>
      item.amountDifference > 0 &&
      (!best || item.amountDifference > best.amountDifference)
        ? item
        : best,
    undefined,
  );
  const topAmountDecrease = items.reduce<ComparisonMetric | undefined>(
    (best, item) =>
      item.amountDifference < 0 &&
      (!best || item.amountDifference < best.amountDifference)
        ? item
        : best,
    undefined,
  );

  return {
    topCountIncrease,
    topCountDecrease,
    topAmountIncrease,
    topAmountDecrease,
  };
};

export const comparisonVariationLabel = (
  currentCount: number,
  previousCount: number,
  variationPct: number | null,
): string => {
  if (previousCount === 0 && currentCount > 0) return "Nuevo";
  if (variationPct == null) return "—";
  if (variationPct === 0) return "0.0%";
  const prefix = variationPct > 0 ? "+" : "";
  return `${prefix}${variationPct.toFixed(1)}%`;
};
