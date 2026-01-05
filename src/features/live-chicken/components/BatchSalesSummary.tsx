import React from "react";
import type { BatchMovement, InboundBatch } from "../types";

interface Props {
  batch: InboundBatch;
  movements: BatchMovement[];
}

export const BatchSalesSummary: React.FC<Props> = ({ batch, movements }) => {
  const sales = movements.filter((m) => m.type === "SALE");
  const losses = movements.filter((m) => m.type === "LOSS");

  if (sales.length === 0 && losses.length === 0) return null;

  const totalQuantitySold = sales.reduce((sum, s) => sum + s.quantity, 0);

  const totalKgSold = sales.reduce((sum, s) => sum + s.weight, 0);

  const totalSalesAmount = sales.reduce((sum, s) => sum + s.amount, 0);

  const totalKgLost = losses.reduce((sum, l) => sum + l.weight, 0);

  const avgWeightSold =
    totalQuantitySold > 0 ? totalKgSold / totalQuantitySold : 0;

  const avgSalePricePerKg =
    totalKgSold > 0 ? totalSalesAmount / totalKgSold : 0;

  const realPricePerKg =
    batch.realWeight > 0 ? batch.totalPaid / batch.realWeight : 0;

  const realLossKg = batch.realWeight - (totalKgSold + totalKgLost);

  const estimatedGain =
    totalSalesAmount - totalQuantitySold * batch.avgWeight * realPricePerKg;

  return (
    <div className="mt-2 rounded-md bg-gray-100 p-2 dark:bg-gray-700">
      <div className="grid grid-cols-2 gap-2 text-sm text-white md:grid-cols-8 md:gap-4">
        <div>🐔 Vendidos: {totalQuantitySold}</div>
        <div>⚖️ Kg vendidos: {totalKgSold.toFixed(2)} kg</div>
        <div>
          💸 Total venta: $
          {totalSalesAmount.toLocaleString("es-MX", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </div>
        <div>📏 Prom kg vendido: {avgWeightSold.toFixed(3)}</div>
        <div>
          💲 Precio prom/kg: $
          {avgSalePricePerKg.toLocaleString("es-MX", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </div>
        <div>❌ Kg baja: {totalKgLost.toFixed(2)}</div>
        <div>📉 Merma real: {realLossKg.toFixed(3)} kg</div>
        <div className="font-semibold">
          📈 Ganancia aprox: $
          {estimatedGain.toLocaleString("es-MX", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
};
