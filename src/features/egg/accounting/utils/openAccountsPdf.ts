import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { getAgingDays } from "@/features/accounting/utils/aging";
import {
  statementRowLabel,
  type StatementMovementRow,
} from "@/features/accounting/utils/openAccounts";
import type { ClientMonthlyReportPdfInput } from "@/features/accounting/api/client-summary.api";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";

const downloadHtml = (html: string) => {
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
};

const printButton = `<p><button onclick="window.print()">Imprimir / Guardar PDF</button></p>
    <script>window.onload=()=>window.print()</script>`;

const escapeHtml = (value: string | number | undefined | null): string =>
  String(value ?? "").replace(/[&<>"']/g, (c) => {
    switch (c) {
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

const tableStyle = `<style>
      body{font-family:Arial,sans-serif;color:#111;padding:24px}
      h1{font-size:20px;margin:0 0 4px} p.sub{color:#555;font-size:12px;margin:0 0 16px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #ccc;padding:6px 8px} th{background:#f3f4f6;text-align:left}
      tfoot td{font-weight:bold}
      @media print{button{display:none}}
    </style>`;

export const buildOpenAccountsHtml = (
  rows: AccountsPayableResponse[],
  title: string,
  generatedAt: string,
): string => {
  const total = rows.reduce((sum, r) => sum + (r.balance ?? 0), 0);
  const body = rows
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.debtorName)} → ${escapeHtml(r.creditorName)}</td>
        <td>${escapeHtml(r.solicitorName ?? "N/A")}</td>
        <td style="text-align:right">${escapeHtml(formatMXN(r.totalAmount))}</td>
        <td style="text-align:right"><strong>${escapeHtml(formatMXN(r.balance))}</strong></td>
        <td style="text-align:right">${getAgingDays(r.date)}d</td>
        <td>${escapeHtml(formatHumanDate(r.date, "short"))}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html><html lang="es"><head><meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    ${tableStyle}</head><body>
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">${rows.length} cuentas · Saldo total ${escapeHtml(formatMXN(total))} · Generado ${escapeHtml(generatedAt)}</p>
    <table><thead><tr>
      <th>Relación</th><th>Solicitante</th>
      <th>Total</th><th>Saldo</th><th>Antigüedad</th><th>Fecha</th>
    </tr></thead><tbody>${body}</tbody>
    <tfoot><tr><td colspan="3">Total saldo</td><td style="text-align:right">${escapeHtml(formatMXN(total))}</td><td colspan="2"></td></tr></tfoot></table>
    <p><button onclick="window.print()">Imprimir / Guardar PDF</button></p>
    <script>window.onload=()=>window.print()</script>
    </body></html>`;
};

export const exportOpenAccountsPdf = (
  rows: AccountsPayableResponse[],
  title: string,
) => {
  downloadHtml(
    buildOpenAccountsHtml(rows, title, new Date().toLocaleString("es-MX")),
  );
};

export const buildStatementHtml = (
  account: AccountsPayableResponse,
  movements: StatementMovementRow[],
  generatedAt: string,
): string => {
  const title = `Estado de cuenta · ${account.debtorName} → ${account.creditorName}`;
  const body = movements
    .map(
      (m) => `<tr>
        <td>${escapeHtml(formatHumanDate(m.movementDate, "short"))}</td>
        <td>${escapeHtml(statementRowLabel(m.movementType))}</td>
        <td style="text-align:right">${escapeHtml(formatMXN(m.amount))}</td>
        <td style="text-align:right"><strong>${escapeHtml(formatMXN(m.balanceAfter))}</strong></td>
        <td>${escapeHtml(m.folio ?? "")}</td>
        <td>${escapeHtml(m.note ?? "")}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html><html lang="es"><head><meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    ${tableStyle}</head><body>
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">Total ${escapeHtml(formatMXN(account.totalAmount))} · Saldo actual ${escapeHtml(formatMXN(account.balance))} · Generado ${escapeHtml(generatedAt)}</p>
    <table><thead><tr>
      <th>Fecha</th><th>Movimiento</th><th>Monto</th><th>Saldo</th><th>Folio</th><th>Nota</th>
    </tr></thead><tbody>${body}</tbody></table>
    <p><button onclick="window.print()">Imprimir / Guardar PDF</button></p>
    <script>window.onload=()=>window.print()</script>
    </body></html>`;
};

export const exportAccountStatementPdf = (
  account: AccountsPayableResponse,
  movements: StatementMovementRow[],
) => {
  downloadHtml(
    buildStatementHtml(account, movements, new Date().toLocaleString("es-MX")),
  );
};

export const buildMonthlyHtml = (
  input: Omit<ClientMonthlyReportPdfInput, "monthKey"> & {
    monthKey?: string;
  },
  generatedAt: string,
): string => {
  const title = `Reporte · ${input.debtorName}`;
  const body = input.movements
    .map(
      (m) => `<tr>
        <td>${escapeHtml(formatHumanDate(m.movementDate, "short"))}</td>
        <td>${escapeHtml(m.creditorName)}</td>
        <td>${escapeHtml(statementRowLabel(m.movementType))}</td>
        <td style="text-align:right">${escapeHtml(formatMXN(m.amount))}</td>
        <td style="text-align:right"><strong>${m.balanceAfter != null ? escapeHtml(formatMXN(m.balanceAfter)) : "—"}</strong></td>
        <td>${escapeHtml(m.folio ?? "")}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html><html lang="es"><head><meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#111;padding:24px}
      h1{font-size:20px;margin:0 0 4px} p.sub{color:#555;font-size:12px;margin:0 0 16px}
      .cards{display:flex;gap:12px;margin:0 0 16px} .card{border:1px solid #ccc;padding:8px 12px;flex:1}
      .card p{margin:0;font-size:11px;color:#555} .card strong{font-size:16px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #ccc;padding:6px 8px} th{background:#f3f4f6;text-align:left}
      @media print{button{display:none}}
    </style></head><body>
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">Del ${escapeHtml(formatHumanDate(input.from, "short"))} al ${escapeHtml(formatHumanDate(input.to, "short"))} · Generado ${escapeHtml(generatedAt)}</p>
    <div class="cards">
      <div class="card"><p>Saldo inicial</p><strong>${escapeHtml(formatMXN(input.openingBalance))}</strong></div>
      <div class="card"><p>Cargos</p><strong>${escapeHtml(formatMXN(input.totalCharges))}</strong></div>
      <div class="card"><p>Pagos</p><strong>${escapeHtml(formatMXN(input.totalPayments))}</strong></div>
      <div class="card"><p>Saldo final</p><strong>${escapeHtml(formatMXN(input.closingBalance))}</strong></div>
    </div>
    <table><thead><tr>
      <th>Fecha</th><th>CEDIS</th><th>Movimiento</th><th>Monto</th><th>Saldo</th><th>Folio</th>
    </tr></thead><tbody>${body}</tbody></table>
    ${printButton}
    </body></html>`;
};

export const exportClientMonthlyPdf = (input: ClientMonthlyReportPdfInput) => {
  downloadHtml(buildMonthlyHtml(input, new Date().toLocaleString("es-MX")));
};
