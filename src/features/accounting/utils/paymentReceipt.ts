const escapeHtml = (value: string | number | null | undefined): string =>
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

const money = (value: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export interface PaymentReceiptInput {
  paymentId: number;
  clientName: string;
  cedisName: string;
  dateLabel: string;
  amount: number;
  appliedAmount: number;
  parkedAmount: number;
  methodLabel: string;
  folio?: string | null;
  collectorId?: number | null;
}

export const buildPaymentReceiptHtml = (
  input: PaymentReceiptInput,
): string => `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Recibo de cobro · ${escapeHtml(input.clientName)}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#111;padding:28px;max-width:620px;margin:0 auto}
      h1{font-size:20px;margin:0 0 4px}p.sub{color:#555;font-size:12px;margin:0 0 20px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{padding:8px 0;border-bottom:1px solid #ddd;text-align:left}
      th{width:38%;color:#555;font-weight:normal}
      .total{font-size:16px;font-weight:bold}
      .note{margin-top:20px;color:#555;font-size:11px}
      @media print{button{display:none}}
    </style>
  </head>
  <body>
    <h1>Recibo de cobro</h1>
    <p class="sub">Ocosur · Huevo · ${escapeHtml(input.dateLabel)}</p>
    <table>
      <tr><th>Cliente</th><td>${escapeHtml(input.clientName)}</td></tr>
      <tr><th>CEDIS</th><td>${escapeHtml(input.cedisName)}</td></tr>
      <tr><th>Forma de pago</th><td>${escapeHtml(input.methodLabel)}</td></tr>
      <tr><th>Referencia</th><td>${escapeHtml(input.folio ?? "—")}</td></tr>
      <tr><th>Monto recibido</th><td class="total">${money(input.amount)}</td></tr>
      <tr><th>Aplicado a deuda</th><td>${money(input.appliedAmount)}</td></tr>
      <tr><th>Saldo a favor</th><td>${money(input.parkedAmount)}</td></tr>
      <tr><th>Registró</th><td>${input.collectorId ? `Usuario #${input.collectorId}` : "—"}</td></tr>
      <tr><th>Pago</th><td>#${input.paymentId}</td></tr>
    </table>
    <p class="note">Conserva este recibo como comprobante del cobro.</p>
    <p><button onclick="window.print()">Imprimir / Guardar PDF</button></p>
    <script>window.onload=()=>window.print()</script>
  </body>
</html>`;

export const openPaymentReceipt = (input: PaymentReceiptInput): void => {
  const win = window.open("", "_blank", "width=720,height=900");
  if (!win) return;
  win.document.open();
  win.document.write(buildPaymentReceiptHtml(input));
  win.document.title = `recibo-cobro-${input.paymentId}`;
  win.document.close();
};
