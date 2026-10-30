import { http } from "@/shared/api/http";
import type {
  AvailableExpense,
  CashFlowCollectionAvailability,
  CashFlowCut,
  CashFlowMovement,
  CashFlowSettings,
  CashFlowSummary,
  CollectionSuggestion,
  CreateAdjustmentRequestDTO,
  CreateCashExpenseRequestDTO,
  CreateCashFlowCutDTO,
  CreateCashFlowSettingsDTO,
  CreateDepositRequestDTO,
  CreateIncomeRequestDTO,
  CreateRemesaPaymentRequestDTO,
  MoveCashFlowMovementRequestDTO,
  Remesa,
  TripSuggestion,
  UpdateCashFlowSettingsDTO,
} from "../types/eggCashFlow.types";

const BASE_URL = "/api/v1/egg-cash-flow";

export const eggCashFlowApi = {
  getSettings: async (): Promise<CashFlowSettings | null> => {
    const response = await http.get<CashFlowSettings>(`${BASE_URL}/settings`);
    if (response.status === 204) return null;
    return response.data;
  },

  createSettings: async (
    payload: CreateCashFlowSettingsDTO,
  ): Promise<CashFlowSettings> => {
    const { data } = await http.post<CashFlowSettings>(
      `${BASE_URL}/settings`,
      payload,
    );
    return data;
  },

  updateSettings: async (
    payload: UpdateCashFlowSettingsDTO,
  ): Promise<CashFlowSettings> => {
    const { data } = await http.put<CashFlowSettings>(
      `${BASE_URL}/settings`,
      payload,
    );
    return data;
  },

  getCollectionAvailability: async (
    date: string,
  ): Promise<CashFlowCollectionAvailability> => {
    const { data } = await http.get<CashFlowCollectionAvailability>(
      `${BASE_URL}/collections/availability`,
      { params: { date } },
    );
    return data;
  },

  getSummary: async (from: string, to: string): Promise<CashFlowSummary> => {
    const { data } = await http.get<CashFlowSummary>(`${BASE_URL}/summary`, {
      params: { from, to },
    });
    return data;
  },

  getMovements: async (
    from: string,
    to: string,
  ): Promise<CashFlowMovement[]> => {
    const { data } = await http.get<CashFlowMovement[]>(
      `${BASE_URL}/movements`,
      {
        params: { from, to },
      },
    );
    return data;
  },

  createIncome: async (
    payload: CreateIncomeRequestDTO,
  ): Promise<CashFlowMovement> => {
    const { data } = await http.post<CashFlowMovement>(
      `${BASE_URL}/movements/income`,
      payload,
    );
    return data;
  },

  createDeposit: async (
    payload: CreateDepositRequestDTO,
  ): Promise<CashFlowMovement> => {
    const { data } = await http.post<CashFlowMovement>(
      `${BASE_URL}/movements/deposit`,
      payload,
    );
    return data;
  },

  createCashExpense: async (
    payload: CreateCashExpenseRequestDTO,
  ): Promise<CashFlowMovement> => {
    const { data } = await http.post<CashFlowMovement>(
      `${BASE_URL}/movements/cash-expense`,
      payload,
    );
    return data;
  },

  createRemesaPayment: async (
    payload: CreateRemesaPaymentRequestDTO,
  ): Promise<CashFlowMovement> => {
    const { data } = await http.post<CashFlowMovement>(
      `${BASE_URL}/movements/remesa-payment`,
      payload,
    );
    return data;
  },

  createAdjustment: async (
    payload: CreateAdjustmentRequestDTO,
  ): Promise<CashFlowMovement> => {
    const { data } = await http.post<CashFlowMovement>(
      `${BASE_URL}/movements/adjustment`,
      payload,
    );
    return data;
  },

  deleteMovement: async (id: number): Promise<void> => {
    await http.delete(`${BASE_URL}/movements/${id}`);
  },

  moveMovement: async (
    id: number,
    payload: MoveCashFlowMovementRequestDTO,
  ): Promise<CashFlowMovement> => {
    const { data } = await http.patch<CashFlowMovement>(
      `${BASE_URL}/movements/${id}`,
      payload,
    );
    return data;
  },

  getTripSuggestions: async (
    from: string,
    to: string,
  ): Promise<TripSuggestion[]> => {
    const { data } = await http.get<TripSuggestion[]>(
      `${BASE_URL}/suggestions/trips`,
      {
        params: { from, to },
      },
    );
    return data;
  },

  getCollectionSuggestions: async (
    from: string,
    to: string,
  ): Promise<CollectionSuggestion[]> => {
    const { data } = await http.get<CollectionSuggestion[]>(
      `${BASE_URL}/suggestions/collections`,
      { params: { from, to } },
    );
    return data;
  },

  getRemesas: async (): Promise<Remesa[]> => {
    const { data } = await http.get<Remesa[]>(`${BASE_URL}/remesas`);
    return data;
  },

  getAvailableExpenses: async (
    from: string,
    to: string,
  ): Promise<AvailableExpense[]> => {
    const { data } = await http.get<AvailableExpense[]>(
      `${BASE_URL}/available-expenses`,
      {
        params: { from, to },
      },
    );
    return data;
  },

  getCuts: async (): Promise<CashFlowCut[]> => {
    const { data } = await http.get<CashFlowCut[]>(`${BASE_URL}/cuts`);
    return data;
  },

  createCut: async (payload: CreateCashFlowCutDTO): Promise<CashFlowCut> => {
    const { data } = await http.post<CashFlowCut>(`${BASE_URL}/cuts`, payload);
    return data;
  },

  deleteCut: async (id: number): Promise<void> => {
    await http.delete(`${BASE_URL}/cuts/${id}`);
  },
};
