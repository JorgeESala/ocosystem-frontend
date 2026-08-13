import {
  Badge,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { formatMXN } from "@/utils/moneyNumbers";
import type { WasteDetail } from "../types";

export function WasteDetailContent({ detail }: { detail: unknown }) {
  const d = detail as WasteDetail;

  const mermaColor =
    d.mermaConTripa > d.thresholdCritical
      ? "red"
      : d.mermaConTripa > d.thresholdWarning
        ? "yellow"
        : "green";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="Fecha de entrada" value={d.entryDate} />
        <InfoCard label="Proveedor" value={d.provider ?? "—"} />
        <InfoCard
          label="Pollos recibidos"
          value={d.chickensReceived.toString()}
        />
        <InfoCard label="Peso total" value={`${d.kgTotal} kg`} />
        <InfoCard label="Pollos vendidos" value={d.chickensSold.toString()} />
        <InfoCard label="Peso vendido" value={`${d.kgSold} kg`} />
        <InfoCard label="Peso tripas" value={`${d.kgGut} kg`} />
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h4 className="mb-3 text-sm font-semibold text-white">
          Indicadores de merma
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">Merma con tripa</p>
            <p className={`text-2xl font-bold text-${mermaColor}-400`}>
              {d.mermaConTripa} g/ave
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Merma sin tripa</p>
            <p className="text-2xl font-bold text-blue-400">
              {d.mermaSinTripa} g/ave
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Badge color="yellow">Alerta: &gt;{d.thresholdWarning}g</Badge>
          <Badge color="red">Crítico: &gt;{d.thresholdCritical}g</Badge>
        </div>
      </div>

      {d.sales.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-white">
            Ventas de la remesa ({d.sales.length})
          </h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeadCell>Fecha</TableHeadCell>
                <TableHeadCell className="text-right">
                  Merma g/ave
                </TableHeadCell>
                <TableHeadCell className="text-right">Cant.</TableHeadCell>
                <TableHeadCell className="text-right">
                  Kg vendidos
                </TableHeadCell>
                <TableHeadCell className="text-right">Tripa (kg)</TableHeadCell>
                <TableHeadCell className="text-right">Total</TableHeadCell>
              </TableHead>
              <TableBody>
                {d.sales.map((s) => {
                  const avgReceivedWeight =
                    d.chickensReceived > 0 ? d.kgTotal / d.chickensReceived : 0;
                  const avgSoldWeight =
                    s.quantity > 0 && s.kgTotal > 0
                      ? s.kgTotal / s.quantity
                      : 0;
                  const mermaPerSale =
                    avgReceivedWeight > 0 && avgSoldWeight > 0
                      ? Math.round((avgReceivedWeight - avgSoldWeight) * 1000)
                      : null;
                  return (
                    <TableRow key={s.saleId}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {s.saleDate}
                      </TableCell>
                      <TableCell
                        className={`text-right text-xs font-medium ${
                          mermaPerSale !== null
                            ? mermaPerSale > d.thresholdCritical
                              ? "text-red-400"
                              : mermaPerSale > d.thresholdWarning
                                ? "text-amber-400"
                                : "text-green-400"
                            : "text-gray-500"
                        }`}
                      >
                        {mermaPerSale !== null ? mermaPerSale : "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {s.quantity}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {s.kgTotal > 0 ? `${s.kgTotal.toFixed(2)} kg` : "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {s.kgGut ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs whitespace-nowrap">
                        {formatMXN(s.saleTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-gray-800 p-2">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
