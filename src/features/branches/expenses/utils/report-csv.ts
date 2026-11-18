import type { BranchExpenseAnalyticsResponse } from "../types";

const escapeCsv = (value: string | number | null | undefined) => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const variation = (value: number | null) =>
  value == null ? "" : `${value.toFixed(2)}%`;

export const buildBranchExpenseReportCsv = (
  data: BranchExpenseAnalyticsResponse,
  scopeLabel: string,
) => {
  const rows: Array<Array<string | number | null | undefined>> = [
    ["Reporte de gastos", scopeLabel],
    [],
    ["Resumen", "Importe actual", "Importe anterior", "Variación", "Movimientos"],
    [
      "Total",
      data.current.totalAmount,
      data.previous.totalAmount,
      variation(data.amountVariationPct),
      data.current.expenseCount,
    ],
    [],
    [
      "Categoría",
      "Importe actual",
      "Importe anterior",
      "Variación",
      "Movimientos",
      "Participación",
    ],
  ];

  const total = data.current.totalAmount || 0;
  for (const category of data.categories) {
    rows.push([
      category.name,
      category.currentAmount,
      category.previousAmount,
      variation(category.amountVariationPct),
      category.currentCount,
      total ? `${((category.currentAmount / total) * 100).toFixed(2)}%` : "0.00%",
    ]);
    for (const child of category.children) {
      rows.push([
        `  ${child.name}`,
        child.currentAmount,
        child.previousAmount,
        variation(child.amountVariationPct),
        child.currentCount,
        total ? `${((child.currentAmount / total) * 100).toFixed(2)}%` : "0.00%",
      ]);
    }
  }

  rows.push([], ["Sucursal", "Importe actual", "Importe anterior", "Variación", "Movimientos"]);
  for (const branch of data.branches) {
    rows.push([
      branch.name,
      branch.currentAmount,
      branch.previousAmount,
      variation(branch.amountVariationPct),
      branch.currentCount,
    ]);
  }

  rows.push([], ["Unidad de negocio", "Importe actual", "Importe anterior", "Variación", "Movimientos"]);
  for (const unit of data.businessUnits) {
    rows.push([
      unit.name,
      unit.currentAmount,
      unit.previousAmount,
      variation(unit.amountVariationPct),
      unit.currentCount,
    ]);
  }

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
};

export const downloadBranchExpenseReportCsv = (
  data: BranchExpenseAnalyticsResponse,
  scopeLabel: string,
) => {
  const csv = `\uFEFF${buildBranchExpenseReportCsv(data, scopeLabel)}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reporte-gastos-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
