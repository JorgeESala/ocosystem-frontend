import { describe, expect, it } from "vitest";
import { buildRouteOrdersPrintHtml } from "../utils/routeOrderSheet";
import type { RouteOrderPrintInput } from "../utils/routeOrderSheet";
import type { RouteOrderDraft } from "../types/routeOrder.types";

const draft: RouteOrderDraft = {
  orderId: 1,
  routeId: 1,
  orderDate: "2030-01-07",
  driverId: 1,
  driverName: "Juan",
  vehicleId: 1,
  vehicleName: "Camión 1",
  tripId: null,
  notes: "Salir temprano",
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
      lastSalePricePerCarton: 60,
      lastSalePricePerKg: 30,
      vegetables: "Tomate 8 kilos",
      condiments: "2 paquetes de longaniza",
      groceries: "Abarrotes",
      comments: "<script>alert(1)</script>",
      added: false,
    },
  ],
};

const eggInput: RouteOrderPrintInput = {
  unitType: "EGG",
  routeName: "Ruta Centro",
  date: "2030-01-07",
  driverName: "Juan",
  vehicleName: "Camión 1",
  currentEggPricePerCarton: 65,
  currentEggPricePerBox: 780,
  currentEggPriceEffectiveFrom: "2030-01-01",
  draft,
};

describe("routeOrderSheet", () => {
  it("genera la hoja de huevo con encabezado, columnas, totales y escape", () => {
    const html = buildRouteOrdersPrintHtml([eggInput]);

    expect(html).toContain("Pedido de ruta · Ruta Centro");
    expect(html).toContain("Huevo");
    expect(html).toContain("Precio actual del huevo");
    expect(html).toContain("Huevo (casilleros)");
    expect(html).toContain("Precio/casillero");
    expect(html).toContain("Precio/caja");
    expect(html).toContain("Clientes externos");
    expect(html).toContain("Subtotal clientes externos");
    expect(html).toContain("TOTAL DEL PEDIDO");
    expect(html).toContain("1.5");
    expect(html).toContain("Tomate 8 kilos");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("window.print()");
    expect(html).toContain("1,170.00");
  });

  it("genera la hoja de pollo vivo solo con cabezas y precio por kilo", () => {
    const chickenDraft: RouteOrderDraft = {
      ...draft,
      rows: [
        {
          ...draft.rows[0],
          headCount: "50",
          quantity: "",
          unitPrice: "35",
        },
      ],
    };
    const html = buildRouteOrdersPrintHtml([
      {
        ...eggInput,
        unitType: "LIVE_CHICKEN",
        draft: chickenDraft,
        currentEggPricePerCarton: null,
        currentEggPricePerBox: null,
        currentEggPriceEffectiveFrom: null,
      },
    ]);

    expect(html).toContain("Cabezas");
    expect(html).toContain("Total cabezas:");
    expect(html).toContain("50");
    expect(html).toContain("Precio/kg");
    expect(html).not.toContain("Kilos");
    expect(html).not.toContain("Precio/caja");
    expect(html).not.toContain("TOTAL DEL PEDIDO");
    expect(html).not.toContain("Precio actual del huevo");
  });

  it("oculta clientes sin pedido y conserva los que solo tienen notas", () => {
    const draftWithEmptyRows: RouteOrderDraft = {
      ...draft,
      rows: [
        ...draft.rows,
        {
          ...draft.rows[0],
          key: "client-11",
          clientId: 11,
          clientName: "Cliente B",
          quantity: "",
          vegetables: "",
          condiments: "",
          groceries: "",
          comments: "",
        },
        {
          ...draft.rows[0],
          key: "client-12",
          clientId: 12,
          clientName: "Cliente C",
          quantity: "",
          vegetables: "Solo nota",
          condiments: "",
          groceries: "",
          comments: "",
        },
      ],
    };

    const html = buildRouteOrdersPrintHtml([
      { ...eggInput, draft: draftWithEmptyRows, hideEmptyRows: true },
    ]);

    expect(html).toContain("Cliente A");
    expect(html).toContain("Cliente C");
    expect(html).not.toContain("Cliente B");
    expect(html).toContain("<strong>Clientes:</strong> 2");
  });

  it("separa clientes internos y externos con sus subtotales", () => {
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

    const html = buildRouteOrdersPrintHtml([
      { ...eggInput, draft: mixedDraft },
    ]);

    expect(html.indexOf("Clientes internos")).toBeLessThan(
      html.indexOf("Clientes externos"),
    );
    expect(html).toContain("Subtotal clientes internos");
    expect(html).toContain("Subtotal clientes externos");
    expect(html).toContain("Sucursal Centro");
    expect(html).toContain("Cliente Externo");
  });

  it("mantiene todos los clientes cuando no se ocultan los vacíos", () => {
    const draftWithEmptyRow: RouteOrderDraft = {
      ...draft,
      rows: [
        ...draft.rows,
        {
          ...draft.rows[0],
          key: "client-11",
          clientId: 11,
          clientName: "Cliente B",
          quantity: "",
          vegetables: "",
          condiments: "",
          groceries: "",
          comments: "",
        },
      ],
    };

    const html = buildRouteOrdersPrintHtml([
      { ...eggInput, draft: draftWithEmptyRow },
    ]);

    expect(html).toContain("Cliente B");
  });

  it("usa el precio por casillero de cuatro decimales para totales exactos", () => {
    const preciseDraft: RouteOrderDraft = {
      ...draft,
      rows: [
        {
          ...draft.rows[0],
          quantity: "18",
          unitPrice: "66.6667",
          vegetables: "",
          condiments: "",
          groceries: "",
          comments: "",
        },
      ],
    };

    const html = buildRouteOrdersPrintHtml([
      { ...eggInput, draft: preciseDraft },
    ]);

    expect(html).toContain("$66.6667");
    expect(html).toContain("$800.00");
    expect(html).toContain("$1,200.00");
  });

  it("separa varias rutas en páginas distintas", () => {
    const html = buildRouteOrdersPrintHtml([
      eggInput,
      { ...eggInput, routeName: "Ruta Norte" },
    ]);

    expect((html.match(/class="sheet"/g) ?? []).length).toBe(2);
    expect(html).toContain("Ruta Norte");
    expect(html).toContain("page-break-after: always");
  });
});
