import { describe, expect, it } from "vitest";
import { buildRouteOrderWorkbook } from "../utils/routeOrderExcel";
import type { RouteOrderPrintInput } from "../utils/routeOrderSheet";
import type { RouteOrderDraft } from "../types/routeOrder.types";

const draft: RouteOrderDraft = {
  orderId: 1,
  routeId: 1,
  orderDate: "2030-01-07",
  driverId: 1,
  driverName: "Chofer Uno",
  vehicleId: 1,
  vehicleName: "Camión Uno",
  tripId: null,
  notes: "",
  rows: [
    {
      key: "client-10",
      clientId: 10,
      clientName: "Cliente A",
      businessName: "Abarrotes A",
      localityName: "Centro",
      quantity: "18",
      unitPrice: "65",
      lastSalePricePerCarton: null,
      lastSalePricePerKg: null,
      vegetables: "Tomate",
      condiments: "",
      groceries: "",
      comments: "",
      added: false,
    },
    {
      key: "client-11",
      clientId: 11,
      clientName: "Cliente B",
      businessName: "Abarrotes B",
      localityName: "Centro",
      quantity: "",
      unitPrice: "65",
      lastSalePricePerCarton: null,
      lastSalePricePerKg: null,
      vegetables: "",
      condiments: "",
      groceries: "",
      comments: "",
      added: false,
    },
  ],
};

const input: RouteOrderPrintInput = {
  unitType: "EGG",
  routeName: "Ruta Centro",
  date: "2030-01-07",
  driverName: "Chofer Uno",
  vehicleName: "Camión Uno",
  currentEggPricePerCarton: 65,
  currentEggPricePerBox: 780,
  currentEggPriceEffectiveFrom: "2030-01-01",
  hideEmptyRows: true,
  draft,
};

describe("routeOrderExcel", () => {
  it("genera un resumen y una hoja por ruta con el formato de la hoja", async () => {
    const workbook = await buildRouteOrderWorkbook([input]);

    expect(workbook.worksheets.map((sheet) => sheet.name)).toContain("Resumen");
    expect(workbook.worksheets.map((sheet) => sheet.name)).toContain(
      "Ruta Centro",
    );

    const summary = workbook.getWorksheet("Resumen");
    expect(summary?.getCell("A1").value).toContain("RESUMEN DE PEDIDOS");

    const sheet = workbook.getWorksheet("Ruta Centro");
    expect(sheet?.getCell("A1").value).toContain("PEDIDO DE RUTA");

    const values: unknown[] = [];
    sheet?.eachRow((row) => {
      values.push(row.values);
    });
    const content = JSON.stringify(values);
    expect(content).toContain("Cliente A");
    expect(content).not.toContain("Cliente B");
    expect(content).toContain("1170");
    expect(content).toContain("1.5");
  });
});
