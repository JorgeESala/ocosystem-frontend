export type EggAccountingView =
  | "RECEIVABLE"
  | "COLLECTIONS"
  | "PAYABLE"
  | "FINANCIAL";

export const modeFromParam = (value: string | null): EggAccountingView => {
  if (value === "PAYABLE" || value === "FINANCIAL") {
    return value;
  }
  if (value === "COLLECTIONS" || value === "COBRAR" || value === "COBRANZA") {
    return "COLLECTIONS";
  }
  return "RECEIVABLE";
};
