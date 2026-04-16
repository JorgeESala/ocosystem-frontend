import { HiArchive } from "react-icons/hi";
import type { BatchDetailView } from "../types.batch";

export const BatchDetailHeader: React.FC<{ data: BatchDetailView }> = ({
  data,
}) => {
  const { batch, summary } = data;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Remesa #{batch.id}</h2>
        <div className="flex gap-2">
          {/* Badge dinámico de disponibilidad */}
          <div className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-900/40 px-3 py-1 text-orange-400">
            <HiArchive size={16} />
            <span className="font-bold">
              Disponibles: {summary.formattedAvailable}
            </span>
          </div>
        </div>
      </div>

      {/* Fila de stats secundarios */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div className="text-gray-400">
          Piezas Iniciales:{" "}
          <span className="text-white">{summary.initialPieces}</span>
        </div>
        <div className="text-gray-400">
          Vendidas: <span className="text-green-400">{summary.soldPieces}</span>
        </div>
        <div className="text-gray-400">
          Bajas: <span className="text-red-400">{summary.adjustedPieces}</span>
        </div>
      </div>
    </div>
  );
};
