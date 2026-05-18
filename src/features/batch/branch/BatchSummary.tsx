import React from "react";
import { Batch, type BranchesBatchSale } from "../../../services/api";

interface Props {
  batch: Batch;
  sales: BranchesBatchSale[];
}

export const BatchSummary: React.FC<Props> = ({ batch, sales }) => {
  if (sales.length === 0) return null;

  const totalQuantitySold = sales.reduce((sum, s) => sum + s.quantitySold, 0);
  const totalKgSold = sales.reduce((sum, s) => sum + s.kgTotal, 0);
  const totalKgGut = sales.reduce((sum, s) => sum + s.kgGut, 0);
  const totalSale = sales.reduce((sum, s) => sum + s.saleTotal, 0);
  const avgWeight = batch.avgChickenWeight ? batch.avgChickenWeight : 0;

  const loss = avgWeight * totalQuantitySold - totalKgSold - totalKgGut;
  const gain = totalSale - avgWeight * totalQuantitySold * batch.pricePerKg;

  return (
    <div className="mt-2 rounded-md bg-gray-100 p-2 dark:bg-gray-700">
      <div className="grid grid-cols-2 gap-2 text-sm text-white md:grid-cols-7 md:gap-4">
        <div>Total Pollos Vendidos: {totalQuantitySold}</div>
        <div>Total Kg Vendidos: {totalKgSold.toFixed(2)} kg</div>
        <div>Total Tripa: {totalKgGut.toFixed(2)} kg</div>
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
        <div className="mt-1 font-semibold md:col-span-7">
          Ganancia: ${Number(gain.toFixed(3)).toLocaleString("es-MX")}
        </div>
      </div>
    </div>
  );
};
