import React from "react";
import { EggQuantityDisplay } from "./EggQuantityDisplay"; // Tu componente de iconos
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";

export const EggMovementsTable: React.FC<{
  movements: any[];
  onEdit: (mov: any) => void;
}> = ({ movements, onEdit }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm text-gray-400">
      <thead className="border-b border-gray-700/50 bg-gray-800/40 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
        <tr>
          <th className="px-4 py-3">Fecha</th>
          <th className="px-4 py-3">Concepto</th>
          <th className="px-4 py-3 text-center">Cantidad desglosada</th>
          <th className="px-4 py-3 text-right">$ Total</th>
          <th className="px-4 py-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800/60">
        {movements.map((mov) => {
          const isAdjustment = mov.type === "ADJUSTMENT";
          return (
            <tr
              key={`${mov.type}-${mov.id}`}
              className={isAdjustment ? "bg-red-950/10" : ""}
            >
              <td className="px-4 py-3.5 text-gray-300">
                {formatHumanDate(mov.date)}
              </td>
              <td
                className={`px-4 py-3.5 font-medium ${isAdjustment ? "text-red-400" : "text-white"}`}
              >
                {isAdjustment ? `⚠️ Baja: ${mov.reason}` : `${mov.concept}`}
              </td>
              <td className="flex justify-center px-4 py-3.5">
                <EggQuantityDisplay totalPieces={mov.quantity} />
              </td>
              <td className="px-4 py-3.5 text-right font-semibold text-white">
                {mov.saleTotal > 0 ? formatMXN(mov.saleTotal) : "-"}
              </td>
              <td className="px-4 py-3.5 text-right">
                <button
                  onClick={() => onEdit(mov)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${isAdjustment ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}
                >
                  Editar
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
