import type { Cell, Workbook, Worksheet } from "exceljs";
import { formatHumanDate, getDayName } from "@/utils/date.utils";
import themeXml from "./routeOrderTheme.xml?raw";
import {
  buildOrderSections,
  computeTotals,
  rowTotal,
  toNumber,
} from "./routeOrderCalc";
import type { RouteOrderPrintInput } from "./routeOrderSheet";
import type {
  RouteOrderDraftRow,
  RouteOrderUnitType,
} from "../types/routeOrder.types";

const GREEN = "FF6BAD91";
const YELLOW = "FFFFFF00";
const MONEY_GREEN = "FF92D050";
const BLACK = "FF000000";
const WHITE = "FFFFFFFF";
const THIN_BORDER = {
  top: { style: "thin" as const, color: { argb: BLACK } },
  left: { style: "thin" as const, color: { argb: BLACK } },
  bottom: { style: "thin" as const, color: { argb: BLACK } },
  right: { style: "thin" as const, color: { argb: BLACK } },
};

const quantityHeader = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Huevo" : "Pollo";

const dayLabel = (date: string): string => {
  const name = getDayName(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
};

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

const lastColumnLetter = (worksheet: Worksheet, lastCol: number): string =>
  worksheet.getColumn(lastCol).letter;

const routeHeaders = (input: RouteOrderPrintInput): string[] => {
  if (input.unitType === "LIVE_CHICKEN") {
    return [
      "No.",
      "Cliente",
      quantityHeader(input.unitType),
      "Alimento",
      "Huevo",
      "Peso",
      "Efectivo",
      "Firma",
      "Comentarios",
    ];
  }
  return [
    "No.",
    "Cliente",
    quantityHeader(input.unitType),
    "Verduras",
    "Condimentos",
    "Abarrotes",
    "Total",
    "Firma",
    "Comentarios",
  ];
};

const routeRowValues = (
  row: RouteOrderDraftRow,
  input: RouteOrderPrintInput,
  index: number,
): (string | number)[] => {
  if (input.unitType === "LIVE_CHICKEN") {
    const weight = toNumber(row.weight);
    const cashAmount = toNumber(row.cashAmount);
    const clientLabel = [row.clientName, row.businessName, row.localityName]
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .join("\n");
    return [
      index + 1,
      clientLabel,
      toNumber(row.headCount),
      row.feedText,
      row.eggText,
      weight > 0 ? weight : "",
      cashAmount > 0 ? cashAmount : "",
      "",
      row.comments,
    ];
  }
  const quantity = toNumber(row.quantity);
  const clientLabel = [row.clientName, row.businessName, row.localityName]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join("\n");
  return [
    index + 1,
    clientLabel,
    quantity,
    row.vegetables,
    row.condiments,
    row.groceries,
    quantity > 0 ? rowTotal(row) : "",
    "",
    row.comments,
  ];
};

const styleHeaderAndData = (
  worksheet: Worksheet,
  headerRow: number,
  lastDataRow: number,
  lastCol: number,
  unitType: RouteOrderUnitType,
) => {
  const egg = unitType === "EGG";
  worksheet.getRow(headerRow).height = 42;
  worksheet.getRow(headerRow).eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { name: "Arial", size: 10 };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
  });

  for (let rowIndex = headerRow + 1; rowIndex <= lastDataRow; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    row.height = 36;
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const notesColumn = egg && col >= 4 && col <= 6;
      const clientColumn = col === 2;
      const commentsColumn = col === lastCol;
      cell.font = {
        name: "Arial",
        size: clientColumn || commentsColumn || notesColumn ? 10 : 11,
        color: { argb: BLACK },
      };
      cell.alignment = {
        horizontal: clientColumn || commentsColumn ? "left" : "center",
        vertical: "middle",
        wrapText: true,
      };
    });
    if (egg) {
      worksheet.getCell(rowIndex, 3).numFmt = "0";
      worksheet.getCell(rowIndex, 7).numFmt = "$#,##0.00;[Red]-$#,##0.00";
    } else {
      worksheet.getCell(rowIndex, 3).numFmt = "0.###";
      worksheet.getCell(rowIndex, 6).numFmt = "0.###";
      worksheet.getCell(rowIndex, 7).numFmt = "$#,##0.00;[Red]-$#,##0.00";
    }
  }
};

const writeTotalLine = (
  worksheet: Worksheet,
  rowIndex: number,
  label: string,
  value: string | number,
  argb: string | undefined,
  money: boolean,
  valueCol: number,
  labelLastCol = 1,
): number => {
  if (labelLastCol > 1) {
    worksheet.mergeCells(rowIndex, 1, rowIndex, labelLastCol);
  }
  const row = worksheet.getRow(rowIndex);
  row.getCell(1).value = label;
  row.getCell(valueCol).value = value;
  if (money) {
    row.getCell(valueCol).numFmt = "$#,##0.00;[Red]-$#,##0.00";
  }
  row.height = 21;
  for (let col = 1; col <= valueCol; col += 1) {
    const cell = row.getCell(col);
    cell.font = { name: "Arial", size: 12, bold: true, color: { argb: BLACK } };
    cell.border = THIN_BORDER;
    if (argb) {
      cell.fill = fill(argb);
    }
  }
  return rowIndex + 1;
};

const writeSectionTotals = (
  worksheet: Worksheet,
  startRow: number,
  rows: RouteOrderDraftRow[],
  input: RouteOrderPrintInput,
  sectionTitle: string,
): number => {
  const totals = computeTotals(rows, input.unitType);
  const egg = input.unitType === "EGG";
  const valueCol = 3;
  const labelLastCol = 2;
  let row = startRow;
  row = writeTotalLine(
    worksheet,
    row,
    `TOTAL DE ${egg ? "CAJAS" : "POLLOS"} · ${sectionTitle.toUpperCase()}`,
    egg ? totals.totalBoxes : totals.totalQuantity,
    YELLOW,
    false,
    valueCol,
    labelLastCol,
  );
  if (egg) {
    row = writeTotalLine(
      worksheet,
      row,
      `SUBTOTAL ${sectionTitle.toUpperCase()}`,
      totals.totalAmount,
      MONEY_GREEN,
      true,
      7,
      6,
    );
    row = writeTotalLine(
      worksheet,
      row,
      "Total casilleros",
      totals.totalQuantity,
      undefined,
      false,
      valueCol,
      labelLastCol,
    );
  }
  row = writeTotalLine(
    worksheet,
    row,
    "Clientes",
    totals.clientCount,
    undefined,
    false,
    valueCol,
    labelLastCol,
  );
  return row;
};

const writeOverallTotals = (
  worksheet: Worksheet,
  startRow: number,
  rows: RouteOrderDraftRow[],
  input: RouteOrderPrintInput,
): number => {
  const totals = computeTotals(rows, input.unitType);
  const egg = input.unitType === "EGG";
  const valueCol = 3;
  const labelLastCol = 2;
  let row = startRow;
  if (egg) {
    row = writeTotalLine(
      worksheet,
      row,
      "TOTAL DEL PEDIDO",
      totals.totalAmount,
      MONEY_GREEN,
      true,
      7,
      6,
    );
  }
  row = writeTotalLine(
    worksheet,
    row,
    `TOTAL DE ${egg ? "CAJAS" : "POLLOS"}`,
    egg ? totals.totalBoxes : totals.totalQuantity,
    YELLOW,
    false,
    valueCol,
    labelLastCol,
  );
  if (egg) {
    row = writeTotalLine(
      worksheet,
      row,
      "Total casilleros",
      totals.totalQuantity,
      undefined,
      false,
      valueCol,
      labelLastCol,
    );
  }
  row = writeTotalLine(
    worksheet,
    row,
    "Clientes",
    totals.clientCount,
    undefined,
    false,
    valueCol,
    labelLastCol,
  );
  return row;
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

  const sections = buildOrderSections(
    input.draft.rows,
    Boolean(input.hideEmptyRows),
    input.unitType,
  );
  const allRows = sections.flatMap((section) => section.rows);
  const headers = routeHeaders(input);
  const lastCol = headers.length;
  const lastColLetter = lastColumnLetter(worksheet, lastCol);

  worksheet.columns = egg
    ? [
        { width: 6 },
        { width: 30 },
        { width: 9 },
        { width: 13 },
        { width: 12 },
        { width: 11 },
        { width: 12 },
        { width: 20 },
        { width: 14 },
      ]
    : [
        { width: 6.0 },
        { width: 34.0 },
        { width: 8.0 },
        { width: 12.0 },
        { width: 9.0 },
        { width: 9.0 },
        { width: 12.0 },
        { width: 20.0 },
        { width: 14.0 },
      ];

  worksheet.mergeCells("A1:D1");
  styleTitleCell(
    worksheet.getCell("A1"),
    GREEN,
    `PEDIDO DE RUTA · ${input.routeName}`,
  );
  worksheet.mergeCells("E1:F1");
  styleTitleCell(worksheet.getCell("E1"), YELLOW, dayLabel(input.date));
  worksheet.mergeCells("G1:I1");
  styleTitleCell(
    worksheet.getCell("G1"),
    GREEN,
    `FECHA  ${formatHumanDate(input.date, "short")}`,
  );
  worksheet.getRow(1).height = 42;
  worksheet.getRow(1).eachCell((cell) => {
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  worksheet.getCell("A1").alignment = {
    horizontal: "left",
    vertical: "middle",
    wrapText: true,
  };

  worksheet.mergeCells("A2:F2");
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

  let rowCursor = 3;
  let rowNumberOffset = 0;
  sections.forEach((section, sectionIndex) => {
    if (section.title) {
      worksheet.mergeCells(`A${rowCursor}:${lastColLetter}${rowCursor}`);
      const heading = worksheet.getCell(`A${rowCursor}`);
      heading.value = section.title.toUpperCase();
      heading.fill = fill(GREEN);
      heading.font = {
        name: "Arial",
        size: 12,
        bold: true,
        color: { argb: WHITE },
      };
      heading.alignment = { horizontal: "left", vertical: "middle" };
      worksheet.getRow(rowCursor).height = 24;
      rowCursor += 1;
    }

    const headerRow = rowCursor;
    const dataRows = section.rows.map((row, index) =>
      routeRowValues(row, input, rowNumberOffset + index),
    );
    rowNumberOffset += dataRows.length;
    const lastDataRow = headerRow + dataRows.length;
    if (dataRows.length > 0) {
      worksheet.addTable({
        name: `Pedido${worksheet.id}_${sectionIndex}`,
        ref: `A${headerRow}:${lastColLetter}${lastDataRow}`,
        style: {
          theme: "TableStyleMedium12",
          showRowStripes: true,
        },
        columns: headers.map((header) => ({
          name: header,
          filterButton: true,
        })),
        rows: dataRows,
      });
    } else {
      headers.forEach((value, index) => {
        worksheet.getCell(headerRow, index + 1).value = value;
      });
    }

    styleHeaderAndData(
      worksheet,
      headerRow,
      lastDataRow,
      lastCol,
      input.unitType,
    );
    if (section.title) {
      rowCursor = writeSectionTotals(
        worksheet,
        lastDataRow + 1,
        section.rows,
        input,
        section.title,
      );
      rowCursor += 1;
    } else {
      rowCursor = lastDataRow + 1;
    }
  });

  rowCursor = writeOverallTotals(worksheet, rowCursor + 1, allRows, input);

  if (input.draft.notes.trim()) {
    rowCursor += 1;
    worksheet.mergeCells(`A${rowCursor}:${lastColLetter}${rowCursor}`);
    const notes = worksheet.getCell(`A${rowCursor}`);
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

  worksheet.pageSetup = {
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    printArea: `A1:${lastColLetter}${rowCursor}`,
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
    properties: { tabColor: { argb: MONEY_GREEN } },
  });
  const unitType = inputs[0]?.unitType ?? "EGG";
  const egg = unitType === "EGG";
  const headers = [
    "Ruta",
    "Día",
    "Fecha",
    "Chofer",
    "Vehículo",
    "Viaje",
    "Tipo",
    "Clientes",
    egg ? "Casilleros" : "Pollo",
    ...(egg ? ["Cajas", "Total"] : []),
  ];
  worksheet.columns = [
    { width: 28 },
    { width: 12 },
    { width: 14 },
    { width: 22 },
    { width: 18 },
    { width: 9 },
    { width: 12 },
    { width: 9 },
    { width: 14 },
    ...(egg ? [{ width: 9 }, { width: 14 }] : []),
  ];
  const lastColLetter = worksheet.getColumn(headers.length).letter;

  worksheet.mergeCells(`A1:${lastColLetter}1`);
  styleTitleCell(worksheet.getCell("A1"), GREEN, "RESUMEN DE PEDIDOS");
  worksheet.getRow(1).height = 33;

  const rows: (string | number)[][] = [];
  for (const input of inputs) {
    const sections = buildOrderSections(
      input.draft.rows,
      Boolean(input.hideEmptyRows),
      input.unitType,
    );
    const allRows = sections.flatMap((section) => section.rows);
    const base = [
      input.routeName,
      dayLabel(input.date),
      formatHumanDate(input.date, "short"),
      input.driverName || "",
      input.vehicleName || "",
      input.tripId != null ? `#${input.tripId}` : "",
    ];
    if (sections.length > 1) {
      for (const section of sections) {
        const totals = computeTotals(section.rows, input.unitType);
        rows.push([
          ...base,
          section.title === "Clientes internos" ? "Internos" : "Externos",
          totals.clientCount,
          totals.totalQuantity,
          ...(egg ? [totals.totalBoxes, totals.totalAmount] : []),
        ]);
      }
    }
    const totals = computeTotals(allRows, input.unitType);
    rows.push([
      ...base,
      "Total",
      totals.clientCount,
      totals.totalQuantity,
      ...(egg ? [totals.totalBoxes, totals.totalAmount] : []),
    ]);
  }

  const headerRow = 3;
  const lastDataRow = headerRow + rows.length;
  worksheet.addTable({
    name: `ResumenPedidos${worksheet.id}`,
    ref: `A${headerRow}:${lastColLetter}${lastDataRow}`,
    style: {
      theme: "TableStyleMedium12",
      showRowStripes: true,
    },
    columns: headers.map((header) => ({
      name: header,
      filterButton: true,
    })),
    rows,
  });

  worksheet.getRow(headerRow).height = 36;
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
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    });
    if (egg) {
      worksheet.getCell(rowIndex, headers.length).numFmt =
        "$#,##0.00;[Red]-$#,##0.00";
    }
  }

  worksheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    printArea: `A1:${lastColLetter}${lastDataRow}`,
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
  (workbook as unknown as { _themes?: Record<string, string> })._themes = {
    theme1: themeXml,
  };

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
