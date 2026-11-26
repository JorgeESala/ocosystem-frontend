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

export const isInternalRow = (row: RouteOrderDraftRow): boolean =>
  row.isInternalBranch || row.isInternalClient;

export interface RouteOrderSection {
  title: string;
  rows: RouteOrderDraftRow[];
}

export const buildOrderSections = (
  rows: RouteOrderDraftRow[],
  hideEmptyRows: boolean,
  unitType: RouteOrderUnitType,
): RouteOrderSection[] => {
  const internal = rows.filter(isInternalRow);
  const external = rows.filter((row) => !isInternalRow(row));
  const internalHasOrder = internal.some((row) =>
    rowHasOrderData(row, unitType),
  );
  const externalHasOrder = external.some((row) =>
    rowHasOrderData(row, unitType),
  );
  const applyFilter = (sectionRows: RouteOrderDraftRow[]) =>
    hideEmptyRows
      ? sectionRows.filter((row) => rowHasOrderData(row, unitType))
      : sectionRows;

  if (internalHasOrder && externalHasOrder) {
    return [
      { title: "Clientes internos", rows: applyFilter(internal) },
      { title: "Clientes externos", rows: applyFilter(external) },
    ];
  }

  const allRows = applyFilter(rows);
  return allRows.length > 0 ? [{ title: "", rows: allRows }] : [];
};

export const rowHasOrderData = (
  row: RouteOrderDraftRow,
  unitType: RouteOrderUnitType,
): boolean => {
  if (unitType === "LIVE_CHICKEN") {
    return (
      toNumber(row.headCount) > 0 ||
      row.feedText.trim().length > 0 ||
      row.eggText.trim().length > 0 ||
      toNumber(row.weight) > 0 ||
      toNumber(row.cashAmount) > 0
    );
  }
  return (
    toNumber(row.quantity) > 0 ||
    [row.vegetables, row.condiments, row.groceries, row.comments].some(
      (value) => (value ?? "").trim().length > 0,
    )
  );
};

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
    const quantity =
      unitType === "EGG" ? toNumber(row.quantity) : toNumber(row.headCount);
    totalQuantity += quantity;
    if (unitType === "EGG") {
      totalAmount += quantity * toNumber(row.unitPrice);
    }
    if (rowHasOrderData(row, unitType)) {
      clientsWithOrder += 1;
    }
  }

  return {
    clientCount: rows.length,
    clientsWithOrder,
    totalQuantity: roundQuantity(totalQuantity),
    totalBoxes: unitType === "EGG" ? cartonsToBoxes(totalQuantity) : 0,
    totalAmount: unitType === "EGG" ? roundMoney(totalAmount) : 0,
  };
};

interface ClientLike {
  id: number;
  name: string;
  businessName?: string | null;
  localityName?: string | null;
  isInternalBranch?: boolean | null;
  isInternalClient?: boolean | null;
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

const compareText = (left: string, right: string): number =>
  left.localeCompare(right, "es", { sensitivity: "base" });

const localityRankOf = (
  row: RouteOrderDraftRow,
  localityRank?: Map<string, number>,
): number => localityRank?.get(row.localityName) ?? Number.MAX_SAFE_INTEGER;

const compareLocality = (
  left: RouteOrderDraftRow,
  right: RouteOrderDraftRow,
  localityRank?: Map<string, number>,
): number => {
  const leftRank = localityRankOf(left, localityRank);
  const rightRank = localityRankOf(right, localityRank);
  if (leftRank !== rightRank) return leftRank - rightRank;
  if (leftRank === Number.MAX_SAFE_INTEGER) {
    return compareText(left.localityName, right.localityName);
  }
  return 0;
};

const compareWithinLocality = (
  left: RouteOrderDraftRow,
  right: RouteOrderDraftRow,
): number => {
  const business = compareText(left.businessName, right.businessName);
  if (business !== 0) return business;
  return compareText(left.clientName, right.clientName);
};

const compareDefaultRows = (
  left: RouteOrderDraftRow,
  right: RouteOrderDraftRow,
  localityRank?: Map<string, number>,
): number => {
  const locality = compareLocality(left, right, localityRank);
  if (locality !== 0) return locality;
  return compareWithinLocality(left, right);
};

export const sortRows = (
  rows: RouteOrderDraftRow[],
  localityRank?: Map<string, number>,
): RouteOrderDraftRow[] =>
  [...rows].sort((left, right) =>
    compareDefaultRows(left, right, localityRank),
  );

const emptyRow = (
  client: ClientLike,
  unitType: RouteOrderUnitType,
  currentEggPricePerCarton: number | null,
  added: boolean,
): RouteOrderDraftRow => ({
  key: `client-${client.id}`,
  clientId: client.id,
  clientName: client.name ?? client.businessName ?? "",
  businessName: client.businessName ?? "",
  localityName: client.localityName ?? "",
  isInternalBranch: Boolean(client.isInternalBranch),
  isInternalClient: Boolean(client.isInternalClient),
  headCount: "",
  quantity: "",
  unitPrice: String(
    defaultUnitPrice(client, unitType, currentEggPricePerCarton),
  ),
  feedText: "",
  eggText: "",
  weight: "",
  cashAmount: "",
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
  unitType: RouteOrderUnitType,
): RouteOrderDraftRow | null => {
  if (line.clientId == null) {
    return null;
  }
  return {
    key: `client-${line.clientId}`,
    clientId: line.clientId,
    clientName: line.clientName ?? line.businessName ?? "",
    businessName: line.businessName ?? "",
    localityName: line.localityName ?? "",
    isInternalBranch: Boolean(line.isInternalBranch),
    isInternalClient: Boolean(line.isInternalClient),
    headCount:
      line.headCount != null && Number(line.headCount) !== 0
        ? String(line.headCount)
        : "",
    quantity:
      unitType === "EGG" && line.quantity != null && Number(line.quantity) !== 0
        ? String(line.quantity)
        : "",
    unitPrice: String(line.unitPrice ?? 0),
    feedText: line.feedText ?? "",
    eggText: line.eggText ?? "",
    weight:
      line.weight != null && Number(line.weight) !== 0
        ? String(line.weight)
        : "",
    cashAmount:
      line.cashAmount != null && Number(line.cashAmount) !== 0
        ? String(line.cashAmount)
        : "",
    lastSalePricePerCarton: null,
    lastSalePricePerKg: null,
    vegetables: unitType === "EGG" ? (line.vegetables ?? "") : "",
    condiments: unitType === "EGG" ? (line.condiments ?? "") : "",
    groceries: unitType === "EGG" ? (line.groceries ?? "") : "",
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
      clientName: client.name ?? client.businessName ?? "",
      businessName: client.businessName ?? "",
      localityName: client.localityName ?? "",
      isInternalBranch:
        saved.isInternalBranch ?? Boolean(client.isInternalBranch),
      isInternalClient:
        saved.isInternalClient ?? Boolean(client.isInternalClient),
      headCount:
        saved.headCount != null && Number(saved.headCount) !== 0
          ? String(saved.headCount)
          : "",
      quantity:
        unitType === "EGG" && Number(saved.quantity) !== 0
          ? String(saved.quantity)
          : "",
      unitPrice: String(
        saved.unitPrice ??
          defaultUnitPrice(client, unitType, currentEggPricePerCarton),
      ),
      feedText: saved.feedText ?? "",
      eggText: saved.eggText ?? "",
      weight:
        saved.weight != null && Number(saved.weight) !== 0
          ? String(saved.weight)
          : "",
      cashAmount:
        saved.cashAmount != null && Number(saved.cashAmount) !== 0
          ? String(saved.cashAmount)
          : "",
      lastSalePricePerCarton: client.lastSalePricePerCarton ?? null,
      lastSalePricePerKg: client.lastSalePricePerKg ?? null,
      vegetables: unitType === "EGG" ? (saved.vegetables ?? "") : "",
      condiments: unitType === "EGG" ? (saved.condiments ?? "") : "",
      groceries: unitType === "EGG" ? (saved.groceries ?? "") : "",
      comments: saved.comments ?? "",
      added: false,
    });
  }

  for (const line of savedExtras) {
    const row = rowFromSavedLine(line, unitType);
    if (row) {
      rows.push(row);
    }
  }

  const localityRank = new Map(
    sheet.localities.map((locality, index) => [locality.name, index]),
  );
  const defaultRows = sortRows(rows, localityRank);
  const savedOrder = new Map<number, number>();
  (sheet.order?.lines ?? []).forEach((line, index) => {
    if (line.clientId != null) {
      savedOrder.set(line.clientId, line.sortOrder ?? index);
    }
  });
  const previousOrder = new Map<number, number>();
  (sheet.previousClientOrder ?? []).forEach((clientId, index) => {
    previousOrder.set(clientId, index);
  });
  const orderMap = savedOrder.size > 0 ? savedOrder : previousOrder;
  const orderedRows =
    orderMap.size === 0
      ? defaultRows
      : [...rows].sort((left, right) => {
          const locality = compareLocality(left, right, localityRank);
          if (locality !== 0) return locality;
          const leftOrder = orderMap.get(left.clientId);
          const rightOrder = orderMap.get(right.clientId);
          if (leftOrder != null && rightOrder != null) {
            return leftOrder - rightOrder;
          }
          if (leftOrder != null) return -1;
          if (rightOrder != null) return 1;
          return compareWithinLocality(left, right);
        });

  return {
    orderId: sheet.order?.id ?? null,
    routeId: sheet.route.id,
    orderDate: sheet.date,
    driverId: sheet.order?.driverId ?? null,
    driverName: sheet.order?.driverName ?? "",
    vehicleId: sheet.order?.vehicleId ?? null,
    vehicleName: sheet.order?.vehicleName ?? "",
    tripId: sheet.order?.tripId ?? null,
    notes: sheet.order?.notes ?? "",
    salesRegenerationRequired: Boolean(sheet.order?.salesRegenerationRequired),
    rows: orderedRows,
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
  const newRow = emptyRow(client, unitType, currentEggPricePerCarton, true);
  const rows = [...draft.rows];
  let insertAt = rows.length;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const candidate = rows[index];
    if (
      isInternalRow(candidate) === isInternalRow(newRow) &&
      candidate.localityName === newRow.localityName
    ) {
      insertAt = index + 1;
      break;
    }
  }
  rows.splice(insertAt, 0, newRow);
  return { ...draft, rows };
};

export const moveDraftRow = (
  draft: RouteOrderDraft,
  clientId: number,
  direction: "up" | "down",
): RouteOrderDraft => {
  const rows = draft.rows;
  const index = rows.findIndex((row) => row.clientId === clientId);
  if (index < 0) return draft;

  const target = rows[index];
  const step = direction === "up" ? -1 : 1;
  const sameGroup = (row: RouteOrderDraftRow) =>
    isInternalRow(row) === isInternalRow(target) &&
    row.localityName === target.localityName;

  let swapIndex = index + step;
  while (
    swapIndex >= 0 &&
    swapIndex < rows.length &&
    !sameGroup(rows[swapIndex])
  ) {
    swapIndex += step;
  }
  if (swapIndex < 0 || swapIndex >= rows.length) return draft;

  const next = [...rows];
  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  return { ...draft, rows: next };
};

export const sortDraftByLocality = (
  draft: RouteOrderDraft,
  localityRank?: Map<string, number>,
): RouteOrderDraft => ({
  ...draft,
  rows: sortRows(draft.rows, localityRank),
});

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
  unitType: RouteOrderUnitType,
): RouteOrderSaveDTO => {
  const lines = draft.rows
    .filter((row) => {
      const hasQuantity =
        toNumber(row.quantity) > 0 || toNumber(row.headCount) > 0;
      const hasNotes =
        unitType === "EGG"
          ? [row.vegetables, row.condiments, row.groceries, row.comments].some(
              (value) => value.trim().length > 0,
            )
          : row.comments.trim().length > 0;
      const hasControlValues =
        unitType === "LIVE_CHICKEN" &&
        (row.feedText.trim().length > 0 ||
          row.eggText.trim().length > 0 ||
          toNumber(row.weight) > 0 ||
          toNumber(row.cashAmount) > 0);
      return hasQuantity || hasNotes || hasControlValues;
    })
    .map((row, index) => ({
      clientId: row.clientId,
      quantity: unitType === "EGG" ? roundQuantity(toNumber(row.quantity)) : 0,
      headCount: roundQuantity(toNumber(row.headCount)),
      unitPrice: roundUnitPrice(toNumber(row.unitPrice)),
      feedText: unitType === "LIVE_CHICKEN" ? row.feedText : "",
      eggText: unitType === "LIVE_CHICKEN" ? row.eggText : "",
      weight:
        unitType === "LIVE_CHICKEN" && row.weight.trim().length > 0
          ? roundQuantity(toNumber(row.weight))
          : undefined,
      cashAmount:
        unitType === "LIVE_CHICKEN" && row.cashAmount.trim().length > 0
          ? roundMoney(toNumber(row.cashAmount))
          : undefined,
      vegetables: unitType === "EGG" ? row.vegetables : "",
      condiments: unitType === "EGG" ? row.condiments : "",
      groceries: unitType === "EGG" ? row.groceries : "",
      comments: row.comments,
      sortOrder: index,
    }));

  return {
    routeId: draft.routeId,
    orderDate: draft.orderDate,
    driverId: draft.driverId,
    driverName: draft.driverName,
    vehicleId: draft.vehicleId,
    vehicleName: draft.vehicleName,
    notes: draft.notes,
    lines,
  };
};
