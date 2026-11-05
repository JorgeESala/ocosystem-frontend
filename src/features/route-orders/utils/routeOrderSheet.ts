import { formatHumanDate, getDayName } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import {
  buildOrderSections,
  computeTotals,
  pricePerBox,
  rowTotal,
  toNumber,
} from "./routeOrderCalc";
import type {
  RouteOrderDraft,
  RouteOrderUnitType,
} from "../types/routeOrder.types";

export interface RouteOrderPrintInput {
  unitType: RouteOrderUnitType;
  routeName: string;
  date: string;
  driverName?: string | null;
  vehicleName?: string | null;
  currentEggPricePerCarton?: number | null;
  currentEggPricePerBox?: number | null;
  currentEggPriceEffectiveFrom?: string | null;
  hideEmptyRows?: boolean;
  tripId?: number | null;
  draft: RouteOrderDraft;
}

const escapeHtml = (value: string | null | undefined): string =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });

const escapeMultiline = (value: string | null | undefined): string =>
  escapeHtml(value).replace(/\n/g, "<br/>");

const unitLabel = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Huevo" : "Pollo vivo";

const quantityLabel = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Huevo (casilleros)" : "Kilos";

const priceLabel = (unitType: RouteOrderUnitType): string =>
  unitType === "EGG" ? "Precio/casillero" : "Precio/kg";

const dayLabel = (date: string): string => {
  const name = getDayName(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const buildColgroup = (unitType: RouteOrderUnitType): string => {
  if (unitType === "EGG") {
    return `<colgroup>
      <col style="width:13%" />
      <col style="width:15%" />
      <col style="width:10%" />
      <col style="width:8%" />
      <col style="width:8%" />
      <col style="width:8%" />
      <col style="width:8%" />
      <col style="width:10%" />
      <col style="width:7%" />
      <col style="width:7%" />
      <col style="width:6%" />
    </colgroup>`;
  }
  return `<colgroup>
    <col style="width:16%" />
    <col style="width:18%" />
    <col style="width:12%" />
    <col style="width:9%" />
    <col style="width:9%" />
    <col style="width:10%" />
    <col style="width:10%" />
    <col style="width:6%" />
    <col style="width:5%" />
    <col style="width:5%" />
  </colgroup>`;
};

const buildHeader = (input: RouteOrderPrintInput): string => {
  const priceReference =
    input.unitType === "EGG" &&
    input.currentEggPricePerCarton != null &&
    input.currentEggPricePerCarton > 0
      ? `<p class="meta">Precio actual del huevo: ${formatMXN(
          input.currentEggPricePerCarton,
        )} por casillero (${formatMXN(
          input.currentEggPricePerBox ??
            pricePerBox(input.currentEggPricePerCarton),
        )} por caja)${
          input.currentEggPriceEffectiveFrom
            ? `, vigente desde ${formatHumanDate(
                input.currentEggPriceEffectiveFrom,
                "short",
              )}`
            : ""
        }.</p>`
      : "";

  return `
    <h1>Pedido de ruta · ${escapeHtml(input.routeName)}</h1>
    <p class="sub">${escapeHtml(dayLabel(input.date))} ${escapeHtml(
      formatHumanDate(input.date, "long"),
    )} · ${unitLabel(input.unitType)}</p>
    <p class="meta">Chofer: ${escapeHtml(
      input.driverName || "________________",
    )} &nbsp;&nbsp;&nbsp; Vehículo: ${escapeHtml(
      input.vehicleName || "________________",
    )}${input.tripId != null ? ` &nbsp;&nbsp;&nbsp; Viaje #${input.tripId}` : ""}</p>
    ${priceReference}`;
};

const buildTable = (
  input: RouteOrderPrintInput,
  sectionRows: RouteOrderPrintInput["draft"]["rows"],
): string => {
  const { unitType } = input;
  const egg = unitType === "EGG";
  const rows = sectionRows
    .map((row) => {
      const quantity = toNumber(row.quantity);
      const unitPrice = toNumber(row.unitPrice);
      const showPrices = quantity > 0 || unitPrice > 0;
      const total = rowTotal(row);
      return `
        <tr>
          <td>${escapeHtml(row.clientName)}</td>
          <td>${escapeHtml(row.businessName)}</td>
          <td>${escapeHtml(row.localityName)}</td>
          <td class="num">${row.quantity ? escapeHtml(row.quantity) : ""}</td>
          <td class="num">${showPrices ? formatMXN(unitPrice) : ""}</td>
          ${
            egg
              ? `<td class="num">${
                  showPrices ? formatMXN(pricePerBox(unitPrice)) : ""
                }</td>`
              : ""
          }
          <td class="num">${quantity > 0 ? formatMXN(total) : ""}</td>
          <td>${escapeMultiline(row.vegetables)}</td>
          <td>${escapeMultiline(row.condiments)}</td>
          <td>${escapeMultiline(row.groceries)}</td>
          <td>${escapeMultiline(row.comments)}</td>
        </tr>`;
    })
    .join("");

  return `
    <table>
      ${buildColgroup(unitType)}
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Negocio</th>
          <th>Localidad</th>
          <th class="num">${quantityLabel(unitType)}</th>
          <th class="num">${priceLabel(unitType)}</th>
          ${egg ? '<th class="num">Precio/caja</th>' : ""}
          <th class="num">Total</th>
          <th>Verduras</th>
          <th>Condimentos</th>
          <th>Abarrotes</th>
          <th>Comentarios</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
};

const buildSectionTotals = (
  input: RouteOrderPrintInput,
  title: string,
  rows: RouteOrderPrintInput["draft"]["rows"],
): string => {
  const totals = computeTotals(rows, input.unitType);
  const quantityTotals =
    input.unitType === "EGG"
      ? `${totals.totalQuantity} casilleros · ${totals.totalBoxes} cajas`
      : `${totals.totalQuantity} kg`;

  return `<div class="section-totals">
    <strong>Subtotal ${escapeHtml(title.toLowerCase())}:</strong>
    ${totals.clientsWithOrder} con pedido · ${quantityTotals} ·
    ${formatMXN(totals.totalAmount)}
  </div>`;
};

const buildOverallTotals = (
  input: RouteOrderPrintInput,
  rows: RouteOrderPrintInput["draft"]["rows"],
): string => {
  const totals = computeTotals(rows, input.unitType);
  const quantityTotals =
    input.unitType === "EGG"
      ? `<span><strong>Total casilleros:</strong> ${totals.totalQuantity}</span>
         <span><strong>Total cajas:</strong> ${totals.totalBoxes}</span>`
      : `<span><strong>Total kilos:</strong> ${totals.totalQuantity}</span>`;

  return `
    <div class="totals">
      <span><strong>Clientes:</strong> ${totals.clientCount} (${totals.clientsWithOrder} con pedido)</span>
      ${quantityTotals}
      <span><strong>TOTAL DEL PEDIDO:</strong> ${formatMXN(totals.totalAmount)}</span>
    </div>
    ${
      input.draft.notes.trim()
        ? `<p class="notes"><strong>Notas:</strong> ${escapeMultiline(
            input.draft.notes,
          )}</p>`
        : ""
    }`;
};

const buildSheetBody = (input: RouteOrderPrintInput): string => {
  const sections = buildOrderSections(
    input.draft.rows,
    Boolean(input.hideEmptyRows),
  );
  const allRows = sections.flatMap((section) => section.rows);
  const sectionsHtml = sections
    .map(
      (section) => `
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
        ${buildTable(input, section.rows)}
        ${buildSectionTotals(input, section.title, section.rows)}`,
    )
    .join("");

  return `${buildHeader(input)}${sectionsHtml}${buildOverallTotals(input, allRows)}`;
};

export const buildRouteOrdersPrintHtml = (
  inputs: RouteOrderPrintInput[],
): string => {
  const sheets = inputs
    .map((input) => `<section class="sheet">${buildSheetBody(input)}</section>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Pedidos de ruta</title>
    <style>
      @page { size: landscape; margin: 8mm; }
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; color:#111; margin:0; padding:10px; }
      h1 { font-size:16px; margin:0 0 2px; }
      p.sub { color:#444; font-size:11px; margin:0 0 4px; }
      p.meta { color:#333; font-size:10px; margin:0 0 6px; }
      table { width:100%; border-collapse:collapse; table-layout:fixed; }
      th, td { border:1px solid #999; padding:3px 4px; font-size:9px; vertical-align:top; overflow-wrap:anywhere; }
      th { background:#eee; text-align:left; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      .num { text-align:right; white-space:nowrap; }
      h2.section-title { font-size:12px; margin:12px 0 4px; text-transform:uppercase; background:#e5e7eb; padding:4px 6px; border:1px solid #999; }
      .section-totals { margin:4px 0 10px; font-size:10px; }
      .totals { display:flex; flex-wrap:wrap; gap:16px; margin-top:8px; font-size:11px; }
      .notes { margin-top:6px; font-size:10px; }
      .sheet { page-break-after: always; }
      .sheet:last-child { page-break-after: auto; }
      button { margin-bottom:8px; }
      @media print { button { display:none; } }
    </style>
  </head>
  <body>
    <button onclick="window.print()">Imprimir / Guardar PDF</button>
    ${sheets}
    <script>window.onload=()=>window.print()</script>
  </body>
</html>`;
};

export const openRouteOrdersPrint = (inputs: RouteOrderPrintInput[]): void => {
  if (inputs.length === 0) return;
  const html = buildRouteOrdersPrintHtml(inputs);
  const win = window.open("", "_blank", "width=1100,height=800");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.title = "pedidos-de-ruta";
  win.document.close();
};
