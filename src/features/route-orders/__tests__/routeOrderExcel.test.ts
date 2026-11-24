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
      headCount: "",
      quantity: "18",
      unitPrice: "65",
      feedText: "",
      eggText: "",
      weight: "",
      cashAmount: "",
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
      headCount: "",
      quantity: "",
      unitPrice: "65",
      feedText: "",
      eggText: "",
      weight: "",
      cashAmount: "",
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
    expect(sheet?.getCell("D5").numFmt).toBe("0");
    expect(sheet?.getCell("H5").numFmt).toContain("$");
    expect(sheet?.getCell("I5").numFmt).not.toContain("$");
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
    expect(content).not.toContain("CLIENTES EXTERNOS");
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
    expect(summaryContent).not.toContain("Externos");
    expect(summaryContent).toContain("Total");
  });

  it("genera la hoja de pollo vivo con las columnas de control", async () => {
    const chickenDraft: RouteOrderDraft = {
      ...draft,
      rows: [
        {
          ...draft.rows[0],
          headCount: "50",
          quantity: "",
          unitPrice: "35",
          feedText: "485",
          eggText: "4.85",
          weight: "219.616",
          cashAmount: "11200.50",
          comments: "10 GY 10 MD",
        },
      ],
    };
    const workbook = await buildRouteOrderWorkbook([
      {
        ...input,
        unitType: "LIVE_CHICKEN",
        draft: chickenDraft,
        currentEggPricePerCarton: null,
        currentEggPricePerBox: null,
        currentEggPriceEffectiveFrom: null,
      },
    ]);

    const sheet = workbook.getWorksheet("Ruta Centro");
    expect(sheet?.getCell("A4").value).toBe("No.");
    expect(sheet?.getCell("B4").value).toBe("Cliente");
    expect(sheet?.getCell("E4").value).toBe("Pollo");
    expect(sheet?.getCell("F4").value).toBe("Alimento");
    expect(sheet?.getCell("G4").value).toBe("Huevo");
    expect(sheet?.getCell("H4").value).toBe("Peso");
    expect(sheet?.getCell("I4").value).toBe("Efectivo");
    expect(sheet?.getCell("J4").value).toBe("Firma");
    expect(sheet?.getCell("K4").value).toBe("Comentarios");
    expect(sheet?.getCell("A5").value).toBe(1);
    expect(sheet?.getCell("E5").value).toBe(50);
    expect(sheet?.getCell("F5").value).toBe("485");
    expect(sheet?.getCell("G5").value).toBe("4.85");
    expect(sheet?.getCell("H5").value).toBe(219.616);
    expect(sheet?.getCell("I5").value).toBe(11200.5);
    expect(sheet?.getCell("J5").value).toBe("");
    expect(sheet?.getCell("H5").numFmt).toBe("0.###");
    expect(sheet?.getCell("I5").numFmt).toContain("$");

    const values: unknown[] = [];
    sheet?.eachRow((row) => {
      values.push(row.values);
    });
    const content = JSON.stringify(values);
    expect(content).toContain("TOTAL DE POLLOS");
    expect(content).toContain("10 GY 10 MD");
    expect(content).not.toContain("Precio por kilo");
    expect(content).not.toContain("Últ. vendido");
    expect(content).not.toContain('"Verduras"');
    expect(content).not.toContain('"Condimentos"');
    expect(content).not.toContain('"Abarrotes"');
    expect(content).not.toContain("TOTAL DEL PEDIDO");

    const summary = workbook.getWorksheet("Resumen");
    expect(summary?.getCell("I3").value).toBe("Pollo");
    expect(summary?.getCell("J3").value ?? null).toBeNull();
  });

  it("deja en blanco peso y efectivo cuando no se capturan", async () => {
    const chickenDraft: RouteOrderDraft = {
      ...draft,
      rows: [
        {
          ...draft.rows[0],
          headCount: "50",
          quantity: "",
          unitPrice: "35",
          feedText: "",
          eggText: "",
          weight: "",
          cashAmount: "",
        },
      ],
    };
    const workbook = await buildRouteOrderWorkbook([
      {
        ...input,
        unitType: "LIVE_CHICKEN",
        draft: chickenDraft,
        currentEggPricePerCarton: null,
        currentEggPricePerBox: null,
        currentEggPriceEffectiveFrom: null,
      },
    ]);

    const sheet = workbook.getWorksheet("Ruta Centro");
    expect(sheet?.getCell("H5").value).toBe("");
    expect(sheet?.getCell("I5").value).toBe("");
  });

  it("numera consecutivamente internos y externos en pollo vivo", async () => {
    const mixedDraft: RouteOrderDraft = {
      ...draft,
      rows: [
        {
          ...draft.rows[0],
          isInternalBranch: true,
          clientName: "Sucursal Interna",
          headCount: "10",
          quantity: "",
        },
        {
          ...draft.rows[0],
          key: "client-11",
          clientId: 11,
          clientName: "Cliente Externo",
          isInternalBranch: false,
          headCount: "20",
          quantity: "",
        },
      ],
    };
    const workbook = await buildRouteOrderWorkbook([
      {
        ...input,
        unitType: "LIVE_CHICKEN",
        draft: mixedDraft,
        currentEggPricePerCarton: null,
        currentEggPricePerBox: null,
        currentEggPriceEffectiveFrom: null,
      },
    ]);

    const sheet = workbook.getWorksheet("Ruta Centro");
    const rowNumbers = sheet
      ?.getColumn(1)
      .values.filter((value): value is number => typeof value === "number");

    expect(rowNumbers).toEqual([1, 2]);
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
