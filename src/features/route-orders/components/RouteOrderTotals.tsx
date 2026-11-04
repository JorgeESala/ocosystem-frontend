import { formatMXN } from "@/utils/moneyNumbers";
import type { RouteOrderTotals as Totals } from "../utils/routeOrderCalc";
import type { RouteOrderUnitType } from "../types/routeOrder.types";

interface Props {
  unitType: RouteOrderUnitType;
  totals: Totals;
}

const Card: React.FC<{ label: string; value: string; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="rounded-xl border border-gray-700 bg-slate-900/60 p-3">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-lg font-semibold text-white">{value}</p>
    {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
  </div>
);

export const RouteOrderTotals: React.FC<Props> = ({ unitType, totals }) => (
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <Card
      label="Clientes en la hoja"
      value={`${totals.clientCount}`}
      hint={`${totals.clientsWithOrder} con pedido`}
    />
    <Card
      label={unitType === "EGG" ? "Total casilleros" : "Total kilos"}
      value={totals.totalQuantity.toLocaleString("es-MX")}
    />
    {unitType === "EGG" ? (
      <Card
        label="Total cajas"
        value={totals.totalBoxes.toLocaleString("es-MX")}
        hint="12 casilleros = 1 caja"
      />
    ) : (
      <Card
        label="Precio promedio"
        value={
          totals.totalQuantity > 0
            ? formatMXN(totals.totalAmount / totals.totalQuantity)
            : "—"
        }
        hint="por kilo"
      />
    )}
    <Card label="Total monetario" value={formatMXN(totals.totalAmount)} />
  </div>
);
