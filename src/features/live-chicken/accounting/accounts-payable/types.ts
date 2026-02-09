// enums (puedes ajustarlos si ya existen globalmente)

import type { AccountingEntityType } from "../types";

export type AccountsPayableSourceType =
  | "BATCH"
  | "DELIVERY"
  | "ADJUSTMENT"
  | "OTHER";

// -------- Requests --------

export interface CreateAccountsPayableRequest {
  creditorType: AccountingEntityType;
  creditorEntityId: number;

  debtorType: AccountingEntityType;
  debtorEntityId: number;

  amount: number;

  sourceType: AccountsPayableSourceType;
  sourceId?: number;

  solicitorId?: number;
  notes?: string;
  date: string;
}

// -------- Responses --------

export interface AccountsPayableResponse {
  id: number;

  creditorId: number;
  creditorName: string;

  debtorId: number;
  debtorName: string;

  totalAmount: number;
  balance: number;

  sourceType?: AccountsPayableSourceType;
  sourceId?: number;
  solicitorName?: string;
  solicitorId?: number;
  date: string;
}

export interface CreditSolicitor {
  id: number;
  name: string;
}
