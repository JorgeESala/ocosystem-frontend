import * as XLSX from "xlsx";
import { formatHumanDate, getDayName } from "@/utils/date.utils";
import {
  computeTotals,
  pricePerBox,
  rowHasOrderData,
  rowTotal,
  toNumber,
} from "./routeOrderCalc";
import type { RouteOrderPrintInput } from "./routeOrderSheet";
import type { RouteOrderUnitType } from "../types/routeOrder.types";

const unitLabel = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Huevo" : "Pollo vivo";

const quantityHeader = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Huevo (casilleros)" : "Kilos";

const priceHeader = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Precio/casillero" : "Precio/kg";

const dayLabel = (date: string): string => {
  const name = getDayName(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const printableRows = (input: RouteOrderPrintInput) =>
  input.hideEmptyRows
    ? input.draft.rows.filter(rowHasOrderData)
    : input.draft.rows;

const buildSheetRows = (input: RouteOrderPrintInput): (string | number)[][] => {
  const egg = input.unitType === "EGG";
  const rows = printableRows(input);
  const totals = computeTotals(rows, input.unitType);

  const header = [
    "Cliente",
    "Negocio",
    "Localidad",
    quantityHeader(input.unitType),
    priceHeader(input.unitType),
    ...(egg ? ["Precio/caja"] : []),
    "Total",
    "Verduras",
    "Condimentos",
    "Abarrotes",
    "Comentarios",
  ];

  const dataRows = rows.map((row) => {
    const unitPrice = toNumber(row.unitPrice);
    return [
      row.clientName,
      row.businessName,
      row.localityName,
      toNumber(row.quantity),
      unitPrice,
      ...(egg ? [pricePerBox(unitPrice)] : []),
      rowTotal(row),
      row.vegetables,
      row.condiments,
      row.groceries,
      row.comments,
    ];
  });

  const data: (string | number)[][] = [
    [`PEDIDO DE RUTA · ${input.routeName}`],
    [
      `${dayLabel(input.date)} ${formatHumanDate(input.date, "long")} · ${unitLabel(input.unitType)}`,
    ],
    [
      "Chofer:",
      input.driverName || "",
      "Vehículo:",
      input.vehicleName || "",
      "Viaje:",
      input.tripId != null ? `#${input.tripId}` : "",
    ],
  ];

  if (
    egg &&
    input.currentEggPricePerCarton != null &&
    input.currentEggPricePerCarton > 0
  ) {
    data.push([
      "Precio actual del huevo (casillero)",
      input.currentEggPricePerCarton,
      "Precio por caja",
      input.currentEggPricePerBox ??
        pricePerBox(input.currentEggPricePerCarton),
      "Vigente desde",
      input.currentEggPriceEffectiveFrom
        ? formatHumanDate(input.currentEggPriceEffectiveFrom, "short")
        : "",
    ]);
  }

  data.push([], header, ...dataRows);
  data.push([
    "Clientes",
    totals.clientCount,
    "Con pedido",
    totals.clientsWithOrder,
  ]);
  data.push(
    egg
      ? [
          "Total casilleros",
          totals.totalQuantity,
          "Total cajas",
          totals.totalBoxes,
          "Total monetario",
          totals.totalAmount,
        ]
      : [
          "Total kilos",
          totals.totalQuantity,
          "Total monetario",
          totals.totalAmount,
        ],
  );

  if (input.draft.notes.trim()) {
    data.push(["Notas", input.draft.notes]);
  }

  return data;
};

const summaryRows = (inputs: RouteOrderPrintInput[]): (string | number)[][] => {
  const rows: (string | number)[][] = [
    ["RESUMEN DE PEDIDOS"],
    [],
    [
      "Ruta",
      "Día",
      "Fecha",
      "Chofer",
      "Vehículo",
      "Clientes",
      "Casilleros/Kilos",
      "Cajas",
      "Total",
    ],
  ];

  for (const input of inputs) {
    const totals = computeTotals(printableRows(input), input.unitType);
    rows.push([
      input.routeName,
      dayLabel(input.date),
      formatHumanDate(input.date, "short"),
      input.driverName || "",
      input.vehicleName || "",
      totals.clientCount,
      totals.totalQuantity,
      input.unitType === "EGG" ? totals.totalBoxes : "",
      totals.totalAmount,
    ]);
  }

  return rows;
};

const sheetName = (name: string, used: Set<string>, index: number): string => {
  const base =
    name
      .replace(/[\\/?*[\]:]/g, " ")
      .trim()
      .slice(0, 31) || `Ruta ${index + 1}`;
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate.toLowerCase())) {
    const extra = ` (${suffix})`;
    candidate = `${base.slice(0, 31 - extra.length)}${extra}`;
    suffix += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
};

export const buildRouteOrderWorkbook = (
  inputs: RouteOrderPrintInput[],
): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  const summary = XLSX.utils.aoa_to_sheet(summaryRows(inputs));
  summary["!cols"] = [
    { wch: 24 },
    { wch: 12 },
    { wch: 14 },
    { wch: 22 },
    { wch: 20 },
    { wch: 10 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(workbook, summary, "Resumen");
  usedNames.add("resumen");

  inputs.forEach((input, index) => {
    const sheet = XLSX.utils.aoa_to_sheet(buildSheetRows(input));
    sheet["!cols"] = [
      { wch: 24 },
      { wch: 26 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 24 },
      { wch: 18 },
      { wch: 18 },
      { wch: 24 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      sheetName(input.routeName, usedNames, index),
    );
  });

  return workbook;
};

export const downloadRouteOrdersExcel = (
  inputs: RouteOrderPrintInput[],
  filename: string,
): void => {
  if (inputs.length === 0) return;
  XLSX.writeFile(buildRouteOrderWorkbook(inputs), filename);
};
