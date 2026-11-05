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
      isInternalBranch: false,
      isInternalClient: false,
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
      isInternalBranch: false,
      isInternalClient: false,
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
    expect(sheet?.getCell("D1").value).toContain("FECHA");
    expect(sheet?.getCell("D6").numFmt).toBe("0");
    expect(sheet?.getCell("H6").numFmt).toContain("$");
    expect(sheet?.getCell("I6").numFmt).not.toContain("$");
    expect(
      (
        workbook as unknown as {
          _themes?: Record<string, string>;
        }
      )._themes?.theme1,
    ).toContain("6AAC90");

    const values: unknown[] = [];
    sheet?.eachRow((row) => {
      values.push(row.values);
    });
    const content = JSON.stringify(values);
    expect(content).toContain("CLIENTES EXTERNOS");
    expect(content).toContain("TOTAL DEL PEDIDO");
    expect(content).toContain("Cliente A");
    expect(content).not.toContain("Cliente B");
    expect(content).toContain("1170");
    expect(content).toContain("1.5");

    const summaryValues: unknown[] = [];
    summary?.eachRow((row) => {
      summaryValues.push(row.values);
    });
    const summaryContent = JSON.stringify(summaryValues);
    expect(summaryContent).toContain("Externos");
    expect(summaryContent).toContain("Total");
  });

  it("separa clientes internos y externos y no repite la columna Ruta", async () => {
    const mixedDraft: RouteOrderDraft = {
      ...draft,
      rows: [
        {
          ...draft.rows[0],
          isInternalBranch: true,
          clientName: "Sucursal Centro",
          quantity: "12",
          comments: "",
        },
        {
          ...draft.rows[0],
          key: "client-11",
          clientId: 11,
          clientName: "Cliente Externo",
          quantity: "6",
          comments: "",
        },
      ],
    };
    const workbook = await buildRouteOrderWorkbook([
      { ...input, draft: mixedDraft },
    ]);

    const sheet = workbook.getWorksheet("Ruta Centro");
    const values: unknown[] = [];
    sheet?.eachRow((row) => {
      values.push(row.values);
    });
    const content = JSON.stringify(values);
    expect(content.indexOf("CLIENTES INTERNOS")).toBeLessThan(
      content.indexOf("CLIENTES EXTERNOS"),
    );
    expect(content).toContain("TOTAL DEL PEDIDO");
    expect(sheet?.getCell("A5").value).toBe("Nombre Cliente");
    expect(sheet?.getCell("J5").value).toBe("Comentarios");
    expect(content).not.toContain("Cliente B");

    const summary = workbook.getWorksheet("Resumen");
    const summaryValues: unknown[] = [];
    summary?.eachRow((row) => {
      summaryValues.push(row.values);
    });
    const summaryContent = JSON.stringify(summaryValues);
    expect(summaryContent).toContain("Internos");
    expect(summaryContent).toContain("Externos");
  });
});
