import { http } from "@/shared/api/http";

export interface ClientStatementMovement {
  accountsPayableId: number;
  creditorEntityId: number;
  movementDate: string;
  movementType: string;
  balanceBefore: number | null;
  amount: number;
  balanceAfter: number | null;
  folio?: string | null;
  note?: string | null;
}

export interface ClientStatementSummary {
  debtorEntityId: number;
  from: string;
  to: string;
  openingBalance: number;
  totalCharges: number;
  totalPayments: number;
  closingBalance: number;
  movements: ClientStatementMovement[];
}

export interface ClientMonthlyReportRow {
  movementDate: string;
  creditorName: string;
  movementType: string;
  amount: number;
  balanceAfter: number | null;
  folio?: string | null;
  note?: string | null;
}

export interface ClientMonthlyReportPdfInput {
  debtorName: string;
  from: string;
  to: string;
  openingBalance: number;
  totalCharges: number;
  totalPayments: number;
  closingBalance: number;
  movements: ClientMonthlyReportRow[];
}

export const fetchClientStatementSummary = async (params: {
  debtorEntityId: number;
  from: string;
  to: string;
}): Promise<ClientStatementSummary> => {
  const search = new URLSearchParams({
    debtorEntityId: String(params.debtorEntityId),
    from: params.from,
    to: params.to,
  });
  const { data } = await http.get<ClientStatementSummary>(
    `/api/read/accounts-payable/client-statement-summary?${search.toString()}`,
  );
  return data;
};
