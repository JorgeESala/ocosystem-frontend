export interface CollectionsSheetRow {
  displayName: string;
  entityType: string;
  saldoRuta: number;
  saldoTotal: number;
  phone: string | null;
}

export interface CollectionsSheetInput {
  routeName: string;
  businessUnitName: string;
  dateLabel: string;
  rows: CollectionsSheetRow[];
  totalRuta: number;
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

const debtorTypeLabel = (entityType: string): string =>
  entityType === "BRANCH"
    ? "Sucursal"
    : entityType === "CASH"
      ? "Contado"
      : "Cliente";

const money = (value: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const buildCollectionsSheetHtml = (
  input: CollectionsSheetInput,
): string => {
  const rows = input.rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.displayName)}</td>
          <td>${escapeHtml(debtorTypeLabel(row.entityType))}</td>
          <td style="text-align:right">${money(row.saldoRuta)}</td>
          <td style="text-align:right">${money(row.saldoTotal)}</td>
          <td>${escapeHtml(row.phone)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Hoja de cobranza · ${escapeHtml(input.routeName)}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#111;padding:24px}
      h1{font-size:20px;margin:0 0 4px} p.sub{color:#555;font-size:12px;margin:0 0 4px}
      p.total{font-size:14px;font-weight:bold;margin:0 0 16px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      th{background:#f3f4f6} tfoot td{font-weight:bold;background:#f9fafb}
      @media print{button{display:none}}
    </style>
  </head>
  <body>
    <h1>Hoja de cobranza · ${escapeHtml(input.routeName)}</h1>
    <p class="sub">${escapeHtml(input.businessUnitName)} · ${escapeHtml(input.dateLabel)} · ${input.rows.length} deudores</p>
    <p class="total">Total a cobrar en la ruta: ${money(input.totalRuta)}</p>
    <p><button onclick="window.print()">Imprimir / Guardar PDF</button></p>
    <table>
      <thead>
        <tr>
          <th>Deudor</th>
          <th>Tipo</th>
          <th style="text-align:right">De esta ruta</th>
          <th style="text-align:right">Total adeudado</th>
          <th>Teléfono</th>
        </tr>
      </thead>
      <tbody>${rows}
      </tbody>
      <tfoot>
        <tr>
          <td>Total</td>
          <td></td>
          <td style="text-align:right">${money(input.totalRuta)}</td>
          <td style="text-align:right">${money(
            input.rows.reduce((sum, row) => sum + row.saldoTotal, 0),
          )}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    <script>window.onload=()=>window.print()</script>
  </body>
</html>`;
};

export const openCollectionsSheet = (input: CollectionsSheetInput): void => {
  const html = buildCollectionsSheetHtml(input);
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.title = `hoja-de-cobranza-${input.routeName}`;
  win.document.close();
};

export interface DayCollectionsSheetTrip {
  routeName: string;
  driverName: string | null;
  vehicleName: string | null;
  rows: CollectionsSheetRow[];
  total: number;
}

export interface DayCollectionsSheetInput {
  businessUnitName: string;
  dateLabel: string;
  trips: DayCollectionsSheetTrip[];
}

export const openDayCollectionsSheet = (
  input: DayCollectionsSheetInput,
): void => {
  const sections = input.trips
    .map((trip) => {
      const rows = trip.rows
        .map(
          (row) => `
            <tr>
              <td>${escapeHtml(row.displayName)}</td>
              <td>${escapeHtml(debtorTypeLabel(row.entityType))}</td>
              <td style="text-align:right">${money(row.saldoRuta)}</td>
              <td style="text-align:right">${money(row.saldoTotal)}</td>
              <td>${escapeHtml(row.phone)}</td>
            </tr>`,
        )
        .join("");
      return `
        <h2>${escapeHtml(trip.routeName)} · ${escapeHtml(trip.driverName)}</h2>
        <p class="sub">${escapeHtml(trip.vehicleName ?? "")} · Total a cobrar: ${money(trip.total)}</p>
        <table>
          <thead><tr><th>Cliente</th><th>Tipo</th><th style="text-align:right">Monto</th><th style="text-align:right">Venta</th><th>Teléfono</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    })
    .join("");
  const grandTotal = input.trips.reduce((sum, trip) => sum + trip.total, 0);
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8" />
<title>Hoja de cobranza · ${escapeHtml(input.dateLabel)}</title>
<style>
body{font-family:Arial,sans-serif;color:#111;padding:24px}
h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;margin:20px 0 4px}
p.sub{color:#555;font-size:12px;margin:0 0 8px}
table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px}
th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f3f4f6}
.total{font-size:14px;font-weight:bold;margin-top:16px}
@media print{button{display:none}}
</style></head><body>
<h1>Hoja de cobranza · ${escapeHtml(input.dateLabel)}</h1>
<p class="sub">${escapeHtml(input.businessUnitName)} · ${input.trips.length} despachos</p>
<p><button onclick="window.print()">Imprimir / Guardar PDF</button></p>
${sections}
<p class="total">Total del día: ${money(grandTotal)}</p>
<script>window.onload=()=>window.print()</script>
</body></html>`;
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.title = `hoja-de-cobranza-dia-${input.dateLabel}`;
  win.document.close();
};
