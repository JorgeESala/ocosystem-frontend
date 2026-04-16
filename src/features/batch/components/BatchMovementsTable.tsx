import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { EggQuantityDisplay } from "./EggQuantityDisplay";
interface Props {
  movements: any[];
  onEdit: (movement: any) => void;
}
export const BatchMovementsTable: React.FC<Props> = ({ movements, onEdit }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-gray-800/50 text-xs text-gray-400 uppercase">
          <tr>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Concepto</th>
            <th className="px-4 py-2 text-center">Cant / Piezas</th>
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
              <td className="px-4 py-3">{formatHumanDate(mov.date)}</td>
              <td className="px-4 py-3 text-white">
                {mov.type === "ADJUSTMENT"
                  ? `⚠️ Baja: ${mov.reason}`
                  : mov.concept}
              </td>
              <td className="px-4 py-3">
                <EggQuantityDisplay totalPieces={mov.quantity} />
                <span className="text-white">{mov.quantity} uds</span>
              </td>
              <td className="px-4 py-3">{formatMXN(mov.saleTotal)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(mov)}
                  className="text-blue-400 hover:underline"
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
