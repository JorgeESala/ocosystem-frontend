import React from "react";
import type { InboundBatch, InboundBatchSale } from "../types";

interface Props {
  batch: InboundBatch;
  sales: InboundBatchSale[];
}

export const BatchSalesSummary: React.FC<Props> = ({ batch, sales }) => {
  if (sales.length === 0) return null;

  const totalQuantitySold = sales.reduce((sum, s) => sum + s.quantitySold, 0);
  const totalKgSold = sales.reduce((sum, s) => sum + s.kgSold, 0);
  const totalDif = sales.reduce((sum, s) => sum + s.kgSent - s.kgSold, 0);
  const totalSale = sales.reduce((sum, s) => sum + s.saleTotal, 0);
  const avgWeight = batch.avgWeight ? batch.avgWeight : 0;
  const realPricePerKg = batch.totalPaid / batch.realWeight;
  const loss = batch.realWeight - totalKgSold;
  const gain = totalSale - avgWeight * totalQuantitySold * realPricePerKg;

  return (
    <div className="mt-2 rounded-md bg-gray-100 p-2 dark:bg-gray-700">
      <div className="grid grid-cols-2 gap-2 text-sm text-white md:grid-cols-8 md:gap-4">
        <div>Pollos Vendidos: {totalQuantitySold}</div>
        <div>Kg Vendidos: {totalKgSold.toFixed(2)} kg</div>
        <div>
          Total Venta: ${Number(totalSale.toFixed(2)).toLocaleString("es-MX")}
        </div>
        <div>
          Promedio Kg: {(totalKgSold / totalQuantitySold).toFixed(3)} kg
        </div>
        <div>
          Precio promedio/kg: $
          {Number((totalSale / totalKgSold).toFixed(3)).toLocaleString("es-MX")}
        </div>
        <div>Merma: {loss.toFixed(4)} kg</div>
        <div className="mt-1">Total de diferencia: {totalDif.toFixed(3)}</div>
        <div className="mt-1 font-semibold">
          Ganancia aprox: ${Number(gain.toFixed(3)).toLocaleString("es-MX")}
        </div>
      </div>
    </div>
  );
};
