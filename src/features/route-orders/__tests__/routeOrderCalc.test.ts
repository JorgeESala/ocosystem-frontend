import { describe, expect, it } from "vitest";
import {
  addClientToDraft,
  applyUnitPriceToDraft,
  buildDraft,
  buildOrderSections,
  cartonsToBoxes,
  computeTotals,
  draftToSavePayload,
  pricePerBox,
  removeClientFromDraft,
  roundUnitPrice,
  rowHasOrderData,
} from "../utils/routeOrderCalc";
import type {
  RouteOrderDraft,
  RouteOrderSheetDTO,
} from "../types/routeOrder.types";
import type { Client } from "@/core/api/types";

const sheet: RouteOrderSheetDTO = {
  date: "2030-01-07",
  route: { id: 1, name: "Ruta Centro" },
  localities: [],
  clients: [
    {
      id: 10,
      name: "Cliente A",
      businessName: "Abarrotes A",
      localityName: "Centro",
      isInternalBranch: false,
      isInternalClient: false,
      lastSalePricePerCarton: 60,
      lastSalePricePerKg: 30,
    },
    {
      id: 11,
      name: "Cliente B",
      businessName: "Abarrotes B",
      localityName: "Centro",
      isInternalBranch: false,
      isInternalClient: false,
      lastSalePricePerCarton: null,
      lastSalePricePerKg: 35,
    },
  ],
  order: {
    id: null,
    routeId: 1,
    orderDate: "2030-01-07",
    driverName: "Juan",
    vehicleName: "Camión 1",
    notes: "Nota general",
    lines: [
      {
        id: 1,
        clientId: 10,
        clientName: "Cliente A",
        businessName: "Abarrotes A",
        localityName: "Centro",
        isInternalBranch: false,
        isInternalClient: false,
        headCount: 0,
        quantity: 18,
        unitPrice: 62,
        vegetables: "Tomate",
        condiments: "",
        groceries: "",
        comments: "",
        sortOrder: 0,
      },
    ],
  },
};

describe("routeOrderCalc", () => {
  it("convierte casilleros a cajas y precio de casillero a caja", () => {
    expect(cartonsToBoxes(237)).toBe(19.75);
    expect(cartonsToBoxes(73)).toBe(6.083);
    expect(pricePerBox(65)).toBe(780);
  });

  it("redondea el precio unitario a cuatro decimales", () => {
    expect(roundUnitPrice(800 / 12)).toBe(66.6667);
    expect(roundUnitPrice(62.5)).toBe(62.5);
  });

  it("considera que hay pedido cuando hay cantidad o notas", () => {
    const draft = buildDraft(sheet, "EGG", 65);
    const base = draft.rows[0];

    expect(
      rowHasOrderData(
        {
          ...base,
          quantity: "",
          vegetables: "",
          condiments: "",
          groceries: "",
          comments: "",
        },
        "EGG",
      ),
    ).toBe(false);
    expect(
      rowHasOrderData({ ...base, quantity: "", vegetables: "Tomate" }, "EGG"),
    ).toBe(true);
    expect(
      rowHasOrderData(
        {
          ...base,
          quantity: "6",
          vegetables: "",
          condiments: "",
          groceries: "",
          comments: "",
        },
        "EGG",
      ),
    ).toBe(true);
  });

  it("calcula totales de la hoja de huevo", () => {
    const totals = computeTotals(
      [
        { quantity: "18", unitPrice: "65" },
        { quantity: "12", unitPrice: "60" },
        { quantity: "", unitPrice: "100" },
      ] as RouteOrderDraft["rows"],
      "EGG",
    );

    expect(totals.clientCount).toBe(3);
    expect(totals.clientsWithOrder).toBe(2);
    expect(totals.totalQuantity).toBe(30);
    expect(totals.totalBoxes).toBe(2.5);
    expect(totals.totalAmount).toBe(1890);
  });

  it("divide la hoja solo cuando ambos grupos tienen pedido", () => {
    const base = buildDraft(sheet, "EGG", 65);
    const internal = {
      ...base.rows[0],
      isInternalBranch: true,
      isInternalClient: false,
      quantity: "5",
    };
    const external = {
      ...base.rows[1],
      isInternalBranch: false,
      isInternalClient: false,
      quantity: "6",
    };

    const both = buildOrderSections([internal, external], true, "EGG");
    expect(both.map((section) => section.title)).toEqual([
      "Clientes internos",
      "Clientes externos",
    ]);

    const onlyInternal = buildOrderSections(
      [
        internal,
        {
          ...external,
          quantity: "",
          vegetables: "",
          condiments: "",
          groceries: "",
          comments: "",
        },
      ],
      true,
      "EGG",
    );
    expect(onlyInternal).toHaveLength(1);
    expect(onlyInternal[0].title).toBe("");
    expect(onlyInternal[0].rows).toEqual([internal]);

    const onlyExternal = buildOrderSections(
      [
        {
          ...internal,
          quantity: "",
          vegetables: "",
          condiments: "",
          groceries: "",
          comments: "",
        },
        external,
      ],
      true,
      "EGG",
    );
    expect(onlyExternal).toHaveLength(1);
    expect(onlyExternal[0].title).toBe("");
    expect(onlyExternal[0].rows).toEqual([external]);
  });

  it("usa el nombre del negocio cuando el cliente no tiene nombre", () => {
    const unnamedSheet: RouteOrderSheetDTO = {
      ...sheet,
      clients: [
        {
          ...sheet.clients[0],
          name: null as unknown as string,
        },
      ],
      order: {
        ...sheet.order,
        lines: [],
      },
    };

    const draft = buildDraft(unnamedSheet, "EGG", 65);

    expect(draft.rows[0].clientName).toBe("Abarrotes A");
  });

  it("suma cabezas en pollo vivo sin calcular total monetario", () => {
    const base = buildDraft(sheet, "EGG", 65);
    const rows = [
      {
        ...base.rows[0],
        quantity: "",
        headCount: "10",
        unitPrice: "35",
      },
      {
        ...base.rows[1],
        quantity: "",
        headCount: "20",
        unitPrice: "35",
      },
    ];

    const totals = computeTotals(rows, "LIVE_CHICKEN");

    expect(totals.clientCount).toBe(2);
    expect(totals.clientsWithOrder).toBe(2);
    expect(totals.totalQuantity).toBe(30);
    expect(totals.totalAmount).toBe(0);
    expect(rowHasOrderData(rows[0], "LIVE_CHICKEN")).toBe(true);
    expect(
      rowHasOrderData(
        { ...rows[0], headCount: "", comments: "Solo comentario" },
        "LIVE_CHICKEN",
      ),
    ).toBe(false);
    expect(
      rowHasOrderData(
        { ...rows[0], headCount: "", feedText: "485" },
        "LIVE_CHICKEN",
      ),
    ).toBe(true);
  });

  it("guarda y recupera alimento, huevo, peso y efectivo en pollo vivo", () => {
    const draft = buildDraft(sheet, "LIVE_CHICKEN", 65);
    const row = {
      ...draft.rows[0],
      headCount: "10",
      feedText: "485",
      eggText: "4.85",
      weight: "219.616",
      cashAmount: "11200.50",
    };

    const payload = draftToSavePayload(
      { ...draft, rows: [row] },
      "LIVE_CHICKEN",
    );

    expect(payload.lines[0]).toMatchObject({
      feedText: "485",
      eggText: "4.85",
      weight: 219.616,
      cashAmount: 11200.5,
    });

    const savedSheet: RouteOrderSheetDTO = {
      ...sheet,
      order: {
        ...sheet.order,
        lines: [
          {
            ...sheet.order.lines[0],
            headCount: 10,
            feedText: "485",
            eggText: "4.85",
            weight: 219.616,
            cashAmount: 11200.5,
          },
        ],
      },
    };
    const savedDraft = buildDraft(savedSheet, "LIVE_CHICKEN", 65);
    const savedRow = savedDraft.rows.find(
      (candidate) => candidate.clientId === 10,
    );

    expect(savedRow?.feedText).toBe("485");
    expect(savedRow?.eggText).toBe("4.85");
    expect(savedRow?.weight).toBe("219.616");
    expect(savedRow?.cashAmount).toBe("11200.5");
  });

  it("incluye una fila solo de control aunque no tenga cabezas", () => {
    const draft = buildDraft(sheet, "LIVE_CHICKEN", 65);
    const row = {
      ...draft.rows[0],
      headCount: "",
      feedText: "485",
      eggText: "4.85",
      weight: "219.616",
      cashAmount: "11200.50",
    };

    const payload = draftToSavePayload(
      { ...draft, rows: [row] },
      "LIVE_CHICKEN",
    );

    expect(payload.lines).toHaveLength(1);
    expect(payload.lines[0]).toMatchObject({
      headCount: 0,
      feedText: "485",
      eggText: "4.85",
      weight: 219.616,
      cashAmount: 11200.5,
    });
  });

  it("arma el borrador con último precio, precio actual y líneas guardadas", () => {
    const draft = buildDraft(sheet, "EGG", 65);

    expect(draft.driverName).toBe("Juan");
    expect(draft.vehicleName).toBe("Camión 1");
    expect(draft.notes).toBe("Nota general");
    expect(draft.rows).toHaveLength(2);

    const first = draft.rows.find((row) => row.clientId === 10);
    expect(first?.quantity).toBe("18");
    expect(first?.unitPrice).toBe("62");
    expect(first?.vegetables).toBe("Tomate");
    expect(first?.lastSalePricePerCarton).toBe(60);

    const second = draft.rows.find((row) => row.clientId === 11);
    expect(second?.quantity).toBe("");
    expect(second?.unitPrice).toBe("65");
    expect(second?.lastSalePricePerCarton).toBeNull();
  });

  it("usa el último precio por kilo en pollo vivo", () => {
    const draft = buildDraft(sheet, "LIVE_CHICKEN", 65);
    const second = draft.rows.find((row) => row.clientId === 11);

    expect(second?.unitPrice).toBe("35");
  });

  it("no conserva verduras, condimentos ni abarrotes en pollo vivo", () => {
    const draft = buildDraft(sheet, "LIVE_CHICKEN", 65);
    const first = draft.rows.find((row) => row.clientId === 10);
    expect(first?.vegetables).toBe("");

    const payload = draftToSavePayload(
      {
        ...draft,
        rows: [
          {
            ...draft.rows[0],
            headCount: "5",
            vegetables: "Tomate",
            condiments: "Longaniza",
            groceries: "Abarrotes",
            comments: "Comentario",
          },
        ],
      },
      "LIVE_CHICKEN",
    );

    expect(payload.lines[0]).toMatchObject({
      vegetables: "",
      condiments: "",
      groceries: "",
      comments: "Comentario",
    });
  });

  it("agrega clientes sin duplicar y permite quitarlos", () => {
    const draft = buildDraft(sheet, "EGG", 65);
    const client: Client = {
      id: 12,
      name: "Cliente C",
      businessName: "Abarrotes C",
      localityName: "Centro",
      isInternalBranch: false,
      lastSalePricePerCarton: 70,
    };

    const withClient = addClientToDraft(draft, client, "EGG", 65);
    expect(withClient.rows).toHaveLength(3);
    expect(addClientToDraft(withClient, client, "EGG", 65)).toBe(withClient);

    const withoutClient = removeClientFromDraft(withClient, 12);
    expect(withoutClient.rows).toHaveLength(2);
  });

  it("aplica un precio a toda la ruta", () => {
    const draft = buildDraft(sheet, "EGG", 65);
    const updated = applyUnitPriceToDraft(draft, 68);

    expect(updated.rows.every((row) => row.unitPrice === "68")).toBe(true);
  });

  it("solo guarda filas con cantidad o notas y convierte los textos a números", () => {
    const draft = buildDraft(sheet, "EGG", 65);
    draft.rows[0].comments = "Sin cantidad pero con nota";
    draft.rows[0].quantity = "";
    draft.rows[0].unitPrice = "70";
    draft.rows[1].quantity = "6";
    draft.rows[1].unitPrice = "65";

    const payload = draftToSavePayload(draft, "EGG");

    expect(payload.routeId).toBe(1);
    expect(payload.orderDate).toBe("2030-01-07");
    expect(payload.lines).toHaveLength(2);
    expect(payload.lines[0]).toMatchObject({
      clientId: 10,
      quantity: 0,
      unitPrice: 70,
      comments: "Sin cantidad pero con nota",
    });
    expect(payload.lines[1]).toMatchObject({
      clientId: 11,
      quantity: 6,
      unitPrice: 65,
    });
  });
});
