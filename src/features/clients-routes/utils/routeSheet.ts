export interface RouteSheetClient {
  name: string;
  businessName?: string | null;
  localityName?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface RouteSheetInput {
  routeName: string;
  daysLabel: string;
  dateLabel: string;
  clients: RouteSheetClient[];
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

export const buildRouteSheetHtml = (input: RouteSheetInput): string => {
  const rows = input.clients
    .map(
      (client) => `
        <tr>
          <td>${escapeHtml(client.businessName ?? client.name)}</td>
          <td>${escapeHtml(client.name)}</td>
          <td>${escapeHtml(client.localityName)}</td>
          <td>${escapeHtml(client.phone)}</td>
          <td>${escapeHtml(client.address)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Hoja de ruta · ${escapeHtml(input.routeName)}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#111;padding:24px}
      h1{font-size:20px;margin:0 0 4px} p.sub{color:#555;font-size:12px;margin:0 0 16px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      th{background:#f3f4f6}
      @media print{button{display:none}}
    </style>
  </head>
  <body>
    <h1>Hoja de ruta · ${escapeHtml(input.routeName)}</h1>
    <p class="sub">${escapeHtml(input.daysLabel)} · ${escapeHtml(input.dateLabel)} · ${input.clients.length} clientes</p>
    <p><button onclick="window.print()">Imprimir / Guardar PDF</button></p>
    <table>
      <thead>
        <tr>
          <th>Negocio</th>
          <th>Cliente</th>
          <th>Localidad</th>
          <th>Teléfono</th>
          <th>Dirección</th>
        </tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>
    <script>window.onload=()=>window.print()</script>
  </body>
</html>`;
};

export const openRouteSheet = (input: RouteSheetInput): void => {
  const html = buildRouteSheetHtml(input);
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.title = `hoja-de-ruta-${input.routeName}`;
  win.document.close();
};
