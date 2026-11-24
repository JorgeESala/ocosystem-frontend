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
      feedText: "",
      eggText: "",
      weight: "",
      cashAmount: "",
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
    expect(html).not.toContain("Clientes externos");
    expect(html).not.toContain("Subtotal clientes externos");
    expect(html).toContain("TOTAL DEL PEDIDO");
    expect(html).toContain("1.5");
    expect(html).toContain("Tomate 8 kilos");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("window.print()");
    expect(html).toContain("1,170.00");
  });

  it("genera la hoja de pollo vivo con las columnas de control", () => {
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

    expect(html).toContain("No.</th>");
    expect(html).toContain("Pollo</th>");
    expect(html).toContain("Alimento</th>");
    expect(html).toContain("Huevo</th>");
    expect(html).toContain("Peso</th>");
    expect(html).toContain("Efectivo</th>");
    expect(html).toContain("Firma</th>");
    expect(html).toContain("Comentarios</th>");
    expect(html).toContain('<td class="signature"></td>');
    expect(html).toContain("Total pollos:");
    expect(html).toContain("485");
    expect(html).toContain("4.85");
    expect(html).toContain("219.616");
    expect(html).toContain("11,200.50");
    expect(html).not.toContain("Precio/kg");
    expect(html).not.toContain("Precio por kilo");
    expect(html).not.toContain("Precio/caja");
    expect(html).not.toContain("<th>Verduras</th>");
    expect(html).not.toContain("<th>Condimentos</th>");
    expect(html).not.toContain("<th>Abarrotes</th>");
    expect(html).not.toContain("TOTAL DEL PEDIDO");
    expect(html).not.toContain("Precio actual del huevo");
  });

  it("numera consecutivamente internos y externos en pollo vivo", () => {
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
    const html = buildRouteOrdersPrintHtml([
      {
        ...eggInput,
        unitType: "LIVE_CHICKEN",
        draft: mixedDraft,
        currentEggPricePerCarton: null,
        currentEggPricePerBox: null,
        currentEggPriceEffectiveFrom: null,
      },
    ]);

    expect(html.indexOf("Sucursal Interna")).toBeLessThan(
      html.indexOf("Cliente Externo"),
    );
    expect(html).toContain('<td class="num">1</td>');
    expect(html).toContain('<td class="num">2</td>');
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
