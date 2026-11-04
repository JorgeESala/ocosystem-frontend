import { Alert, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { useEggPriceReferenceHistory } from "../api/routeOrders.queries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const EggPriceHistoryModal: React.FC<Props> = ({ open, onClose }) => {
  const { data = [], isLoading, isError } = useEggPriceReferenceHistory(open);

  return (
    <Modal show={open} size="lg" onClose={onClose}>
      <ModalHeader>Historial del precio actual del huevo</ModalHeader>
      <ModalBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <Alert color="failure">
            No se pudo cargar el historial de precios.
          </Alert>
        ) : data.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Todavía no hay precios registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs tracking-[0.12em] text-gray-400 uppercase">
                <tr>
                  <th className="px-3 py-2">Vigente desde</th>
                  <th className="px-3 py-2 text-right">Por casillero</th>
                  <th className="px-3 py-2 text-right">Por caja</th>
                  <th className="px-3 py-2">Notas</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-t border-gray-800">
                    <td className="px-3 py-2">
                      {formatHumanDate(row.effectiveFrom, "short")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatMXN(row.pricePerCarton)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatMXN(row.pricePerBox)}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {row.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};
