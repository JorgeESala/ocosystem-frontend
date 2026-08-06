import {
  Badge,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import type { DeliveryDetail } from "../types";

export function DeliveryDetailContent({ detail }: { detail: unknown }) {
  const d = detail as DeliveryDetail;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-gray-400">Hoy</p>
            <p className="text-sm font-medium text-white">{d.today}</p>
          </div>
          <div className="ml-auto">
            {d.isDeliveryDay ? (
              <Badge color="red">Día de entrega — sin remesa registrada</Badge>
            ) : (
              <Badge color="green">No es día de entrega</Badge>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-white">
          Días de entrega programados
        </h4>
        {d.expectedDays.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {d.expectedDays.map((day) => (
              <Badge key={day} color="blue">
                {day}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">Sin programación</p>
        )}
        {d.eggExpectedDays.length > 0 && (
          <>
            <p className="mt-2 text-xs text-gray-400">Huevos:</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {d.eggExpectedDays.map((day) => (
                <Badge key={day} color="purple">
                  {day}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-white">
          Remesas recientes
        </h4>
        {d.recentBatches.length === 0 ? (
          <p className="text-xs text-gray-500">Sin remesas registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeadCell>Fecha</TableHeadCell>
                <TableHeadCell className="text-right">Pollos</TableHeadCell>
                <TableHeadCell className="text-right">Kg</TableHeadCell>
                <TableHeadCell>Proveedor</TableHeadCell>
              </TableHead>
              <TableBody>
                {d.recentBatches.map((b) => (
                  <TableRow key={b.batchId}>
                    <TableCell className="text-xs">{b.entryDate}</TableCell>
                    <TableCell className="text-right text-xs">
                      {b.chickenQuantity ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {b.kgTotal ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {b.provider ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
