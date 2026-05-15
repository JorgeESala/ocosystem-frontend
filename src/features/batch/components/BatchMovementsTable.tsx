import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { UNIT_CONFIG } from "../config/unitConfig";
import type { BusinessUnitType } from "../types.batch";

interface Props {
  movements: any[];
  unitType: BusinessUnitType; // Necesitamos el tipo para saber qué config usar
  onEdit: (movement: any) => void;
}

export const BatchMovementsTable: React.FC<Props> = ({
  movements,
  unitType,
  onEdit,
}) => {
  const config = UNIT_CONFIG[unitType];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-gray-800/50 text-xs text-gray-400 uppercase">
          <tr>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Concepto</th>
            {/* Cambiamos el header según la unidad si es necesario */}
            <th className="px-4 py-2 text-center"> Cantidad </th>
            <th className="px-4 py-2 text-right">$ Total</th>
            <th className="px-4 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((mov) => (
            <tr
              key={`${mov.type}-${mov.id}`}
              className="border-t border-gray-800 hover:bg-gray-700/30"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {formatHumanDate(mov.date)}
              </td>
              <td className="px-4 py-3 text-white">
                {mov.type === "ADJUSTMENT"
                  ? `⚠️ Baja: ${mov.reason}`
                  : mov.concept}
              </td>
              <td className="px-4 py-3 text-center">
                {/* USO DE LA CONFIGURACIÓN:
                   Invocamos la función de renderizado específica de la unidad 
                */}
                {config.renderMovementQuantity(mov)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-white">
                {mov.saleTotal > 0 ? formatMXN(mov.saleTotal) : "-"}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(mov)}
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
