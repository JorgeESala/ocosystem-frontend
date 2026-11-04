import type { Cell, Workbook, Worksheet } from "exceljs";
import { formatHumanDate, getDayName } from "@/utils/date.utils";
import {
  computeTotals,
  pricePerBox,
  rowHasOrderData,
  toNumber,
} from "./routeOrderCalc";
import type { RouteOrderPrintInput } from "./routeOrderSheet";
import type { RouteOrderUnitType } from "../types/routeOrder.types";

const GREEN = "FF6BAD91";
const YELLOW = "FFFFFF00";
const MONEY_GREEN = "FF92D050";
const BLACK = "FF000000";
const THIN_BORDER = {
  top: { style: "thin" as const, color: { argb: BLACK } },
  left: { style: "thin" as const, color: { argb: BLACK } },
  bottom: { style: "thin" as const, color: { argb: BLACK } },
  right: { style: "thin" as const, color: { argb: BLACK } },
};

const quantityHeader = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Huevo (casilleros)" : "Kilos";

const priceHeader = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Precio por casillero" : "Precio por kilo";

const dayLabel = (date: string): string => {
  const name = getDayName(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const printableRows = (input: RouteOrderPrintInput) =>
  input.hideEmptyRows
    ? input.draft.rows.filter(rowHasOrderData)
    : input.draft.rows;

const fill = (argb: string) => ({
  type: "pattern" as const,
  pattern: "solid" as const,
  fgColor: { argb },
});

const styleTitleCell = (cell: Cell, argb: string, value?: string) => {
  cell.value = value ?? null;
  cell.fill = fill(argb);
  cell.font = { name: "Arial", size: 14, bold: true, color: { argb: BLACK } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
};

const buildRouteSheet = (
  workbook: Workbook,
  input: RouteOrderPrintInput,
  sheetName: string,
): Worksheet => {
  const egg = input.unitType === "EGG";
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: MONEY_GREEN } },
  });

  const rows = printableRows(input);
  const totals = computeTotals(rows, input.unitType);
  const headers = [
    "Nombre Cliente",
    "Nombre de la tienda",
    "Localidad",
    "Ruta",
    quantityHeader(input.unitType),
    egg ? "Verduras (kilos)" : "Verduras",
    "Condimentos",
    "Abarrotes",
    priceHeader(input.unitType),
    ...(egg ? ["Precio por caja"] : []),
    "Comentarios",
  ];
  const lastCol = headers.length;
  const tableRows = rows.map((row) => {
    const unitPrice = toNumber(row.unitPrice);
    return [
      row.clientName,
      row.businessName,
      row.localityName,
      "",
      toNumber(row.quantity),
      row.vegetables,
      row.condiments,
      row.groceries,
      unitPrice,
      ...(egg ? [pricePerBox(unitPrice)] : []),
      row.comments,
    ];
  });

  worksheet.columns = [
    { width: 28.7 },
    { width: 37.2 },
    { width: 27.0 },
    { width: 14.1 },
    { width: 14.6 },
    { width: 33.5 },
    { width: 28.7 },
    { width: 20.5 },
    { width: 19.6 },
    ...(egg ? [{ width: 18.1 }] : []),
    { width: 28.0 },
  ];

  worksheet.mergeCells("A1:B1");
  styleTitleCell(
    worksheet.getCell("A1"),
    GREEN,
    `PEDIDO DE RUTA · ${input.routeName}`,
  );
  styleTitleCell(worksheet.getCell("C1"), YELLOW, dayLabel(input.date));
  styleTitleCell(
    worksheet.getCell("D1"),
    GREEN,
    `FECHA  ${formatHumanDate(input.date, "short")}`,
  );
  styleTitleCell(
    worksheet.getCell("E1"),
    YELLOW,
    formatHumanDate(input.date, "short"),
  );
  worksheet.getRow(1).height = 33;
  worksheet.getRow(1).eachCell((cell) => {
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  worksheet.mergeCells("A2:E2");
  const meta = [
    `Chofer: ${input.driverName || "________________"}`,
    `Vehículo: ${input.vehicleName || "________________"}`,
    input.tripId != null ? `Viaje #${input.tripId}` : null,
  ]
    .filter(Boolean)
    .join("   ·   ");
  const metaCell = worksheet.getCell("A2");
  metaCell.value = meta;
  metaCell.font = { name: "Arial", size: 11, color: { argb: BLACK } };
  metaCell.alignment = { horizontal: "left", vertical: "middle" };

  if (
    egg &&
    input.currentEggPricePerCarton != null &&
    input.currentEggPricePerCarton > 0
  ) {
    worksheet.mergeCells("A3:E3");
    const priceCell = worksheet.getCell("A3");
    priceCell.value = `Precio actual del huevo: ${input.currentEggPricePerCarton.toFixed(
      2,
    )} por casillero (${(
      input.currentEggPricePerBox ?? pricePerBox(input.currentEggPricePerCarton)
    ).toFixed(2)} por caja)${
      input.currentEggPriceEffectiveFrom
        ? `, vigente desde ${formatHumanDate(
            input.currentEggPriceEffectiveFrom,
            "short",
          )}`
        : ""
    }`;
    priceCell.font = { name: "Arial", size: 10, color: { argb: BLACK } };
    priceCell.alignment = { horizontal: "left", vertical: "middle" };
  }

  const headerRow = 4;
  const tableStart = headerRow;
  const lastDataRow = headerRow + tableRows.length;
  const tableNameBase = `PedidoRuta${input.routeName.replace(/[^A-Za-z0-9]/g, "") || "Ruta"}`;
  if (tableRows.length > 0) {
    worksheet.addTable({
      name: `${tableNameBase}${worksheet.id}`,
      ref: `A${tableStart}:${worksheet.getColumn(lastCol).letter}${lastDataRow}`,
      style: {
        theme: "TableStyleMedium12",
        showRowStripes: true,
      },
      columns: headers.map((header) => ({ name: header, filterButton: false })),
      rows: tableRows,
    });
  } else {
    const header = worksheet.getRow(headerRow);
    headers.forEach((value, index) => {
      header.getCell(index + 1).value = value;
    });
  }

  worksheet.getRow(headerRow).height = 42;
  worksheet.getRow(headerRow).eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { name: "Arial", size: 12 };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
  });

  for (let rowIndex = headerRow + 1; rowIndex <= lastDataRow; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    row.height = 30;
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const notesColumn = col >= 6 && col <= 8;
      cell.font = {
        name: "Arial",
        size: notesColumn || col === lastCol ? 12 : 14,
        color: { argb: BLACK },
      };
      cell.alignment = {
        horizontal: col >= 5 && col <= (egg ? 10 : 9) ? "center" : "left",
        vertical: "middle",
        wrapText: true,
      };
    });
    worksheet.getCell(rowIndex, 5).numFmt = "0.###";
    worksheet.getCell(rowIndex, egg ? 9 : 9).numFmt =
      "$#,##0.0000;[Red]-$#,##0.0000";
    if (egg) {
      worksheet.getCell(rowIndex, 10).numFmt = "$#,##0.00;[Red]-$#,##0.00";
    }
  }

  let totalRow = lastDataRow + 2;
  const writeTotal = (
    label: string,
    value: string | number,
    argb?: string,
    money = false,
  ) => {
    const row = worksheet.getRow(totalRow);
    row.getCell(1).value = label;
    row.getCell(5).value = value;
    if (money) {
      row.getCell(5).numFmt = "$#,##0.00;[Red]-$#,##0.00";
    }
    row.height = 21;
    for (let col = 1; col <= 5; col += 1) {
      const cell = row.getCell(col);
      cell.font = {
        name: "Arial",
        size: 12,
        bold: true,
        color: { argb: BLACK },
      };
      cell.border = THIN_BORDER;
      if (argb) {
        cell.fill = fill(argb);
      }
    }
    totalRow += 1;
  };

  writeTotal(
    egg ? "TOTAL DE CAJAS" : "TOTAL DE KILOS",
    egg ? totals.totalBoxes : totals.totalQuantity,
    YELLOW,
  );
  writeTotal("VALOR MONETARIO APROX.", totals.totalAmount, MONEY_GREEN, true);
  writeTotal(egg ? "Total casilleros" : "Total kilos", totals.totalQuantity);

  const clientsRow = worksheet.getRow(totalRow);
  clientsRow.getCell(1).value = "Clientes";
  clientsRow.getCell(5).value = totals.clientCount;
  clientsRow.getCell(7).value = "Con pedido";
  clientsRow.getCell(8).value = totals.clientsWithOrder;
  for (let col = 1; col <= 8; col += 1) {
    const cell = clientsRow.getCell(col);
    cell.font = { name: "Arial", size: 12, color: { argb: BLACK } };
    cell.border = THIN_BORDER;
  }

  if (input.draft.notes.trim()) {
    worksheet.mergeCells(
      `A${totalRow + 2}:${worksheet.getColumn(lastCol).letter}${totalRow + 2}`,
    );
    const notes = worksheet.getCell(`A${totalRow + 2}`);
    notes.value = `Notas: ${input.draft.notes}`;
    notes.font = {
      name: "Arial",
      size: 11,
      italic: true,
      color: { argb: BLACK },
    };
    notes.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
    notes.fill = fill("FFF2F2F2");
  }

  const printLastRow = totalRow + (input.draft.notes.trim() ? 2 : 0);
  worksheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    printArea: `A1:${worksheet.getColumn(lastCol).letter}${printLastRow}`,
    margins: {
      left: 0.3,
      right: 0.3,
      top: 0.4,
      bottom: 0.4,
      header: 0.2,
      footer: 0.2,
    },
  };

  return worksheet;
};

const buildSummarySheet = (
  workbook: Workbook,
  inputs: RouteOrderPrintInput[],
): Worksheet => {
  const worksheet = workbook.addWorksheet("Resumen", {
    views: [{ showGridLines: false }],
  });
  const headers = [
    "Ruta",
    "Día",
    "Fecha",
    "Chofer",
    "Vehículo",
    "Viaje",
    "Clientes",
    "Casilleros/Kilos",
    "Cajas",
    "Total",
  ];
  worksheet.columns = [
    { width: 28 },
    { width: 14 },
    { width: 14 },
    { width: 24 },
    { width: 20 },
    { width: 10 },
    { width: 10 },
    { width: 16 },
    { width: 10 },
    { width: 16 },
  ];

  worksheet.mergeCells("A1:J1");
  styleTitleCell(worksheet.getCell("A1"), GREEN, "RESUMEN DE PEDIDOS");
  worksheet.getRow(1).height = 33;

  const rows = inputs.map((input) => {
    const totals = computeTotals(printableRows(input), input.unitType);
    return [
      input.routeName,
      dayLabel(input.date),
      formatHumanDate(input.date, "short"),
      input.driverName || "",
      input.vehicleName || "",
      input.tripId != null ? `#${input.tripId}` : "",
      totals.clientCount,
      totals.totalQuantity,
      input.unitType === "EGG" ? totals.totalBoxes : "",
      totals.totalAmount,
    ];
  });

  const headerRow = 3;
  const lastDataRow = headerRow + rows.length;
  worksheet.addTable({
    name: `ResumenPedidos${worksheet.id}`,
    ref: `A${headerRow}:J${lastDataRow}`,
    style: {
      theme: "TableStyleMedium12",
      showRowStripes: true,
    },
    columns: headers.map((header) => ({ name: header, filterButton: false })),
    rows,
  });

  worksheet.getRow(headerRow).height = 42;
  worksheet.getRow(headerRow).eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { name: "Arial", size: 12 };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
  });
  for (let rowIndex = headerRow + 1; rowIndex <= lastDataRow; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    row.height = 24;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: "Arial", size: 11, color: { argb: BLACK } };
      cell.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      };
    });
    worksheet.getCell(rowIndex, 10).numFmt = "$#,##0.00;[Red]-$#,##0.00";
  }

  worksheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    printArea: `A1:J${lastDataRow}`,
    margins: {
      left: 0.3,
      right: 0.3,
      top: 0.4,
      bottom: 0.4,
      header: 0.2,
      footer: 0.2,
    },
  };
  return worksheet;
};

export const buildRouteOrderWorkbook = async (
  inputs: RouteOrderPrintInput[],
): Promise<Workbook> => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Ocosur";
  workbook.created = new Date();

  buildSummarySheet(workbook, inputs);

  const usedNames = new Set<string>(["resumen"]);
  inputs.forEach((input, index) => {
    const base =
      input.routeName
        .replace(/[\\/?*[\]:]/g, " ")
        .trim()
        .slice(0, 31) || `Ruta ${index + 1}`;
    let candidate = base;
    let suffix = 2;
    while (usedNames.has(candidate.toLowerCase())) {
      const extra = ` (${suffix})`;
      candidate = `${base.slice(0, 31 - extra.length)}${extra}`;
      suffix += 1;
    }
    usedNames.add(candidate.toLowerCase());
    buildRouteSheet(workbook, input, candidate);
  });

  return workbook;
};

export const downloadRouteOrdersExcel = async (
  inputs: RouteOrderPrintInput[],
  filename: string,
): Promise<void> => {
  if (inputs.length === 0) return;
  const workbook = await buildRouteOrderWorkbook(inputs);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
