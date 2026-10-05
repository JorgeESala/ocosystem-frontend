import type { ReceiptCostDTO, ReceiptLineDTO } from "../types";

export function lineDisplayName(line: ReceiptLineDTO): string {
  if (line.productName) return line.productName;
  if (line.observedName) return line.observedName;
  if (line.sourceBarcode) return line.sourceBarcode;
  return `Línea ${line.lineNumber}`;
}

export function normalizedLineCost(
  line: ReceiptLineDTO,
  cost: ReceiptCostDTO,
): { amount: number; unit: string } | null {
  if (cost.toLineUnitFactor && cost.toLineUnitFactor > 0) {
    return { amount: cost.unitCost / cost.toLineUnitFactor, unit: line.unitName };
  }
  if (cost.costUnit.toLowerCase() === line.unitName.toLowerCase()) {
    return { amount: cost.unitCost, unit: line.unitName };
  }
  return null;
}
