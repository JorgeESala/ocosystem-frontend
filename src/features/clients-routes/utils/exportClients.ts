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

export const buildClientsExportRows = (
  clients: Client[],
  routesForClient: (client: Client) => Route[],
): string[][] =>
  clients.map((client) => [
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
    client.phone ?? "",
    client.address ?? "",
  ]);

export const exportClientsToExcel = (
  clients: Client[],
  routesForClient: (client: Client) => Route[],
  filename: string,
): void => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    CLIENT_EXPORT_HEADERS,
    ...buildClientsExportRows(clients, routesForClient),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
  XLSX.writeFile(workbook, filename);
};
