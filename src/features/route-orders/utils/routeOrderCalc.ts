import type { Client } from "@/core/api/types";
import type {
  RouteOrderDraft,
  RouteOrderDraftRow,
  RouteOrderLineDTO,
  RouteOrderSaveDTO,
  RouteOrderSheetDTO,
  RouteOrderUnitType,
} from "../types/routeOrder.types";

export const CARTONS_PER_BOX = 12;

export const toNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const roundQuantity = (value: number): number =>
  Math.round((value + Number.EPSILON) * 1000) / 1000;

export const roundUnitPrice = (value: number): number =>
  Math.round((value + Number.EPSILON) * 10000) / 10000;

export const cartonsToBoxes = (cartons: number): number =>
  roundQuantity(cartons / CARTONS_PER_BOX);

export const pricePerBox = (pricePerCarton: number): number =>
  roundMoney(pricePerCarton * CARTONS_PER_BOX);

export const rowTotal = (row: {
  quantity: string;
  unitPrice: string;
}): number => roundMoney(toNumber(row.quantity) * toNumber(row.unitPrice));

export const rowHasOrderData = (row: RouteOrderDraftRow): boolean =>
  toNumber(row.quantity) > 0 ||
  [row.vegetables, row.condiments, row.groceries, row.comments].some(
    (value) => (value ?? "").trim().length > 0,
  );

export interface RouteOrderTotals {
  clientCount: number;
  clientsWithOrder: number;
  totalQuantity: number;
  totalBoxes: number;
  totalAmount: number;
}

export const computeTotals = (
  rows: RouteOrderDraftRow[],
  unitType: RouteOrderUnitType,
): RouteOrderTotals => {
  let totalQuantity = 0;
  let totalAmount = 0;
  let clientsWithOrder = 0;

  for (const row of rows) {
    const quantity = toNumber(row.quantity);
    totalQuantity += quantity;
    totalAmount += quantity * toNumber(row.unitPrice);
    if (rowHasOrderData(row)) {
      clientsWithOrder += 1;
    }
  }

  return {
    clientCount: rows.length,
    clientsWithOrder,
    totalQuantity: roundQuantity(totalQuantity),
    totalBoxes: unitType === "EGG" ? cartonsToBoxes(totalQuantity) : 0,
    totalAmount: roundMoney(totalAmount),
  };
};

interface ClientLike {
  id: number;
  name: string;
  businessName?: string | null;
  localityName?: string | null;
  lastSalePricePerCarton?: number | null;
  lastSalePricePerKg?: number | null;
}

const defaultUnitPrice = (
  client: Pick<ClientLike, "lastSalePricePerCarton" | "lastSalePricePerKg">,
  unitType: RouteOrderUnitType,
  currentEggPricePerCarton: number | null,
): number => {
  const lastPrice =
    unitType === "EGG"
      ? client.lastSalePricePerCarton
      : client.lastSalePricePerKg;

  if (lastPrice != null && lastPrice > 0) {
    return lastPrice;
  }
  if (unitType === "EGG" && currentEggPricePerCarton != null) {
    return currentEggPricePerCarton;
  }
  return 0;
};

const sortRows = (rows: RouteOrderDraftRow[]): RouteOrderDraftRow[] =>
  [...rows].sort((left, right) => {
    const locality = left.localityName.localeCompare(right.localityName, "es", {
      sensitivity: "base",
    });
    if (locality !== 0) return locality;

    const business = left.businessName.localeCompare(right.businessName, "es", {
      sensitivity: "base",
    });
    if (business !== 0) return business;

    return left.clientName.localeCompare(right.clientName, "es", {
      sensitivity: "base",
    });
  });

const emptyRow = (
  client: ClientLike,
  unitType: RouteOrderUnitType,
  currentEggPricePerCarton: number | null,
  added: boolean,
): RouteOrderDraftRow => ({
  key: `client-${client.id}`,
  clientId: client.id,
  clientName: client.name,
  businessName: client.businessName ?? "",
  localityName: client.localityName ?? "",
  quantity: "",
  unitPrice: String(
    defaultUnitPrice(client, unitType, currentEggPricePerCarton),
  ),
  lastSalePricePerCarton: client.lastSalePricePerCarton ?? null,
  lastSalePricePerKg: client.lastSalePricePerKg ?? null,
  vegetables: "",
  condiments: "",
  groceries: "",
  comments: "",
  added,
});

const rowFromSavedLine = (
  line: RouteOrderLineDTO,
): RouteOrderDraftRow | null => {
  if (line.clientId == null) {
    return null;
  }
  return {
    key: `client-${line.clientId}`,
    clientId: line.clientId,
    clientName: line.clientName,
    businessName: line.businessName ?? "",
    localityName: line.localityName ?? "",
    quantity:
      line.quantity != null && Number(line.quantity) !== 0
        ? String(line.quantity)
        : "",
    unitPrice: String(line.unitPrice ?? 0),
    lastSalePricePerCarton: null,
    lastSalePricePerKg: null,
    vegetables: line.vegetables ?? "",
    condiments: line.condiments ?? "",
    groceries: line.groceries ?? "",
    comments: line.comments ?? "",
    added: true,
  };
};

export const buildDraft = (
  sheet: RouteOrderSheetDTO,
  unitType: RouteOrderUnitType,
  currentEggPricePerCarton: number | null,
): RouteOrderDraft => {
  const routeClientIds = new Set(sheet.clients.map((client) => client.id));
  const savedByClient = new Map<number, RouteOrderLineDTO>();
  const savedExtras: RouteOrderLineDTO[] = [];

  for (const line of sheet.order?.lines ?? []) {
    if (line.clientId == null) continue;
    if (routeClientIds.has(line.clientId)) {
      savedByClient.set(line.clientId, line);
    } else {
      savedExtras.push(line);
    }
  }

  const rows: RouteOrderDraftRow[] = [];

  for (const client of sheet.clients) {
    const saved = savedByClient.get(client.id);
    if (!saved) {
      rows.push(emptyRow(client, unitType, currentEggPricePerCarton, false));
      continue;
    }
    rows.push({
      key: `client-${client.id}`,
      clientId: client.id,
      clientName: client.name,
      businessName: client.businessName ?? "",
      localityName: client.localityName ?? "",
      quantity: Number(saved.quantity) !== 0 ? String(saved.quantity) : "",
      unitPrice: String(
        saved.unitPrice ??
          defaultUnitPrice(client, unitType, currentEggPricePerCarton),
      ),
      lastSalePricePerCarton: client.lastSalePricePerCarton ?? null,
      lastSalePricePerKg: client.lastSalePricePerKg ?? null,
      vegetables: saved.vegetables ?? "",
      condiments: saved.condiments ?? "",
      groceries: saved.groceries ?? "",
      comments: saved.comments ?? "",
      added: false,
    });
  }

  for (const line of savedExtras) {
    const row = rowFromSavedLine(line);
    if (row) {
      rows.push(row);
    }
  }

  return {
    routeId: sheet.route.id,
    orderDate: sheet.date,
    driverName: sheet.order?.driverName ?? "",
    vehicleName: sheet.order?.vehicleName ?? "",
    notes: sheet.order?.notes ?? "",
    rows: sortRows(rows),
  };
};

export const addClientToDraft = (
  draft: RouteOrderDraft,
  client: Client,
  unitType: RouteOrderUnitType,
  currentEggPricePerCarton: number | null,
): RouteOrderDraft => {
  if (draft.rows.some((row) => row.clientId === client.id)) {
    return draft;
  }
  return {
    ...draft,
    rows: sortRows([
      ...draft.rows,
      emptyRow(client, unitType, currentEggPricePerCarton, true),
    ]),
  };
};

export const removeClientFromDraft = (
  draft: RouteOrderDraft,
  clientId: number,
): RouteOrderDraft => ({
  ...draft,
  rows: draft.rows.filter((row) => row.clientId !== clientId),
});

export const applyUnitPriceToDraft = (
  draft: RouteOrderDraft,
  price: number,
): RouteOrderDraft => ({
  ...draft,
  rows: draft.rows.map((row) => ({
    ...row,
    unitPrice: String(price),
  })),
});

export const updateDraftRow = (
  draft: RouteOrderDraft,
  clientId: number,
  patch: Partial<RouteOrderDraftRow>,
): RouteOrderDraft => ({
  ...draft,
  rows: draft.rows.map((row) =>
    row.clientId === clientId ? { ...row, ...patch } : row,
  ),
});

export const draftToSavePayload = (
  draft: RouteOrderDraft,
): RouteOrderSaveDTO => {
  const lines = draft.rows
    .filter((row) => {
      const hasQuantity = toNumber(row.quantity) > 0;
      const hasNotes = [
        row.vegetables,
        row.condiments,
        row.groceries,
        row.comments,
      ].some((value) => value.trim().length > 0);
      return hasQuantity || hasNotes;
    })
    .map((row, index) => ({
      clientId: row.clientId,
      quantity: roundQuantity(toNumber(row.quantity)),
      unitPrice: roundUnitPrice(toNumber(row.unitPrice)),
      vegetables: row.vegetables,
      condiments: row.condiments,
      groceries: row.groceries,
      comments: row.comments,
      sortOrder: index,
    }));

  return {
    routeId: draft.routeId,
    orderDate: draft.orderDate,
    driverName: draft.driverName,
    vehicleName: draft.vehicleName,
    notes: draft.notes,
    lines,
  };
};
