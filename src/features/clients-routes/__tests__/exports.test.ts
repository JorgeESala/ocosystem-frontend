import { describe, it, expect } from "vitest";
import {
  buildClientsExportRows,
  CLIENT_EXPORT_HEADERS,
} from "../utils/exportClients";
import {
  buildRoutePerformanceRows,
  ROUTE_PERFORMANCE_HEADERS,
} from "../utils/exportRoutePerformance";
import type { Client, Route } from "@/core/api/types";
import { formatHumanDate } from "@/utils/date.utils";

const client: Client = {
  id: 1,
  name: "Juan Pérez",
  businessName: "Abarrotes Peña",
  localityId: 1,
  localityName: "Peña Blanca",
  isInternalBranch: false,
  isInternalClient: false,
  active: true,
  lastPurchaseDate: "2030-01-20",
  phone: "811-123-4567",
  address: "Calle 1",
};

const routes: Route[] = [
  { id: 1, name: "Ruta Centro", active: true, localityIds: [1] },
];

describe("exportClients", () => {
  it("arma las filas con ruta derivada, tipo y contacto", () => {
    const rows = buildClientsExportRows([client], () => routes);

    expect(CLIENT_EXPORT_HEADERS).toHaveLength(9);
    expect(rows).toHaveLength(1);
    expect(rows[0][0]).toBe("Juan Pérez");
    expect(rows[0][3]).toBe("Ruta Centro");
    expect(rows[0][4]).toBe("Externo");
    expect(rows[0][5]).toBe("Activo");
    expect(rows[0][6]).toBe(formatHumanDate("2030-01-20", "short"));
    expect(rows[0][7]).toBe("811-123-4567");
  });
});

describe("exportRoutePerformance", () => {
  it("arma las filas con variación y bucket sin ruta", () => {
    const rows = buildRoutePerformanceRows([
      {
        routeId: null,
        routeName: null,
        totalQuantity: 10,
        totalSales: 1000,
        cogs: 100,
        fuelExpense: 50,
        profit: 850,
        marginPct: 85,
        previousTotalSales: 500,
        previousProfit: 400,
        salesPct: 100,
        profitPct: 112.5,
        saleCount: 2,
      },
    ]);

    expect(ROUTE_PERFORMANCE_HEADERS).toHaveLength(9);
    expect(rows[0][0]).toBe("Ventas sin ruta");
    expect(rows[0][6]).toBe(85);
    expect(rows[0][7]).toBe(100);
    expect(rows[0][8]).toBe(2);
  });
});
