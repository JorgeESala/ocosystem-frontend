import type {
  BranchProfitCashDetailDTO,
  BranchProfitReportDTO,
} from "../types";

export interface ProfitSummaryItem {
  label: string;
  totalSales: number;
  totalChickenCost: number;
  totalProfit: number;
  batchCount: number;
  quantitySoldInRange: number;
  kgSoldInRange: number;
  percentage: number;
}

export interface CashSummaryItem {
  label: string;
  branchId: number;
  branchName: string;
  businessUnitName: string;
  totalSales: number;
  totalExpenses: number;
  expectedCash: number;
  percentage: number;
}

export interface CashBreakdownTotals {
  totalSales: number;
  totalExpenses: number;
  totalExpectedCash: number;
}

export interface CashBreakdown {
  items: CashSummaryItem[];
  totals: CashBreakdownTotals;
}

export interface BranchProfitSummary {
  totalSales: number;
  totalExpenses: number;
  totalChickenCosts: number;
  profit: number;
  expectedCash: number;
  batchCount: number;
  profitMargin: number;
  expenseRatio: number;
  chickenCostRatio: number;
  byBranch: ProfitSummaryItem[];
  byBusinessUnit: CashBreakdown;
  topBranch?: ProfitSummaryItem;
  topBusinessUnit?: CashSummaryItem;
}

const sumNumber = (value: number | string | null | undefined) =>
  Number(value ?? 0);

const excludedBusinessUnitNames = new Set(["merma", "matados"]);

const normalizeText = (value: string) => value.trim().toLowerCase();

const formatBranchItems = (
  report: BranchProfitReportDTO,
): ProfitSummaryItem[] => {
  const map = new Map<string, Omit<ProfitSummaryItem, "percentage">>();

  for (const item of report.batchDetails ?? []) {
    const key = item.branchName || "Sin sucursal";
    const current = map.get(key);
    const totalSales = sumNumber(item.totalSalesInRange);
    const totalChickenCost = sumNumber(item.computedCostForRange);
    const totalProfit = totalSales - totalChickenCost;
    const quantitySoldInRange = sumNumber(item.quantitySoldInRange);
    const kgSoldInRange = sumNumber(item.kgSoldInRange);

    if (!current) {
      map.set(key, {
        label: key,
        totalSales,
        totalChickenCost,
        totalProfit,
        batchCount: 1,
        quantitySoldInRange,
        kgSoldInRange,
      });
      continue;
    }

    current.totalSales += totalSales;
    current.totalChickenCost += totalChickenCost;
    current.totalProfit += totalProfit;
    current.batchCount += 1;
    current.quantitySoldInRange += quantitySoldInRange;
    current.kgSoldInRange += kgSoldInRange;
  }

  const totalSales = sumNumber(report.totalSales);

  return [...map.values()]
    .map((item) => ({
      ...item,
      percentage: totalSales > 0 ? (item.totalSales / totalSales) * 100 : 0,
    }))
    .sort((a, b) => b.totalSales - a.totalSales);
};

const formatCashItems = (
  cashDetails: BranchProfitCashDetailDTO[] = [],
): CashBreakdown => {
  const visibleCashDetails = cashDetails.filter(
    (item) =>
      !excludedBusinessUnitNames.has(normalizeText(item.businessUnitName)),
  );

  const enriched = visibleCashDetails.map((item) => {
    const branchId = sumNumber(item.branchId);
    const totalSales = sumNumber(item.totalSales);
    const totalExpenses = sumNumber(item.totalExpenses);
    const expectedCash = sumNumber(item.expectedCash);
    return {
      label: `${item.branchName || "Sin sucursal"} - ${item.businessUnitName || "Sin unidad"}`,
      branchId,
      branchName: item.branchName || "Sin sucursal",
      businessUnitName: item.businessUnitName || "Sin unidad",
      totalSales,
      totalExpenses,
      expectedCash,
    };
  });

  const totalExpectedCash = enriched.reduce(
    (sum, item) => sum + item.expectedCash,
    0,
  );
  const totals: CashBreakdownTotals = {
    totalSales: enriched.reduce((sum, item) => sum + item.totalSales, 0),
    totalExpenses: enriched.reduce((sum, item) => sum + item.totalExpenses, 0),
    totalExpectedCash,
  };

  const items = enriched
    .map((item) => ({
      ...item,
      percentage:
        totalExpectedCash > 0
          ? (item.expectedCash / totalExpectedCash) * 100
          : 0,
    }))
    .sort((a, b) => b.expectedCash - a.expectedCash);

  return { items, totals };
};

export const buildBranchProfitSummary = (
  report: BranchProfitReportDTO | null,
): BranchProfitSummary => {
  if (!report) {
    return {
      totalSales: 0,
      totalExpenses: 0,
      totalChickenCosts: 0,
      profit: 0,
      expectedCash: 0,
      batchCount: 0,
      profitMargin: 0,
      expenseRatio: 0,
      chickenCostRatio: 0,
      byBranch: [],
      byBusinessUnit: {
        items: [],
        totals: { totalSales: 0, totalExpenses: 0, totalExpectedCash: 0 },
      },
    };
  }

  const totalSales = sumNumber(report.totalSales);
  const totalExpenses = sumNumber(report.totalExpenses);
  const totalChickenCosts = sumNumber(report.totalChickenCostsProRated);
  const profit = sumNumber(report.profit);
  const expectedCash = totalSales - totalExpenses;

  const batchCount = report.batchDetails?.length ?? 0;
  const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;
  const expenseRatio = totalSales > 0 ? (totalExpenses / totalSales) * 100 : 0;
  const chickenCostRatio =
    totalSales > 0 ? (totalChickenCosts / totalSales) * 100 : 0;

  const byBranch = formatBranchItems(report);
  const byBusinessUnit = formatCashItems(report.cashDetails);

  return {
    totalSales,
    totalExpenses,
    totalChickenCosts,
    profit,
    expectedCash,
    batchCount,
    profitMargin,
    expenseRatio,
    chickenCostRatio,
    byBranch,
    byBusinessUnit,
    topBranch: byBranch[0],
    topBusinessUnit: byBusinessUnit.items[0],
  };
};
