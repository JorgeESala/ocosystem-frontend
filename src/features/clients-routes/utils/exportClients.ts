import * as XLSX from "xlsx";
import type { Client, Route } from "@/core/api/types";
import { formatHumanDate } from "@/utils/date.utils";

export const CLIENT_EXPORT_HEADERS = [
  "Nombre",
  "Negocio",
  "Localidad",
  "Ruta",
  "Tipo",
  "Estado",
  "Última compra",
  "Teléfono",
  "Dirección",
];

export const CLIENT_LAST_PRICE_HEADER = "Último precio (casillero)";

const headersFor = (includeLastPrice: boolean): string[] =>
  includeLastPrice
    ? [
        ...CLIENT_EXPORT_HEADERS.slice(0, 7),
        CLIENT_LAST_PRICE_HEADER,
        ...CLIENT_EXPORT_HEADERS.slice(7),
      ]
    : CLIENT_EXPORT_HEADERS;

export const buildClientsExportRows = (
  clients: Client[],
  routesForClient: (client: Client) => Route[],
  includeLastPrice = false,
): string[][] =>
  clients.map((client) => {
    const row = [
      client.name,
      client.businessName ?? "",
      client.localityName ?? "",
      routesForClient(client)
        .map((route) => route.name)
        .join(", "),
      client.isInternalBranch
        ? "Sucursal"
        : client.isInternalClient
          ? "Cliente interno"
          : "Externo",
      client.active === false ? "Inactivo" : "Activo",
      client.lastPurchaseDate
        ? formatHumanDate(client.lastPurchaseDate, "short")
        : "",
    ];
    if (includeLastPrice) {
      row.push(
        client.lastSalePricePerCarton != null
          ? client.lastSalePricePerCarton.toFixed(2)
          : "",
      );
    }
    return [...row, client.phone ?? "", client.address ?? ""];
  });

export const exportClientsToExcel = (
  clients: Client[],
  routesForClient: (client: Client) => Route[],
  filename: string,
  includeLastPrice = false,
): void => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    headersFor(includeLastPrice),
    ...buildClientsExportRows(clients, routesForClient, includeLastPrice),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
  XLSX.writeFile(workbook, filename);
};
