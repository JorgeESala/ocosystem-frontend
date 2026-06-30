import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import type { BusinessUnitType } from "../../types.batch";
import TripInlineRow from "@/features/trips/components/TripInlineRow";
import { useTripsForBatch } from "@/features/trips/api/trips.queries";
import { buildTripGroups } from "@/features/trips/utils/tripGrouping";
import type { TripsUnitType } from "@/features/trips/types/trip.types";

export const ChickenMovementsTable: React.FC<{
  movements: any[];
  onEdit: (mov: any) => void;
  unitType: BusinessUnitType;
  batchId: number;
}> = ({ movements, onEdit, unitType, batchId }) => {
  const tripsUnitType: TripsUnitType =
    unitType === "EGG" ? "EGG" : "LIVE_CHICKEN";
  const { data: trips = [] } = useTripsForBatch(tripsUnitType, batchId);
  const groups = buildTripGroups(movements, trips);

  if (movements.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 py-10 text-center text-sm text-slate-400">
        Aún no hay ventas ni bajas registradas.
      </div>
    );
  }

  const renderSaleColumns = (mov: any, isOtherBatch: boolean) => {
    if (isOtherBatch) return null;
    const isAdjustment = mov.type === "ADJUSTMENT";
    const kgVendidos = Number(mov.weight || 0);
    const kgEnviados = Number(mov.kgSent || mov.weight || 0);
    const difKg = kgVendidos - kgEnviados;
    const qty = Number(mov.quantity || 0);

    if (isAdjustment) {
      return (
        <>
          <div className="col-span-2 truncate text-xs text-slate-400">
            {formatHumanDate(mov.date, "short")}
          </div>
          <div className="col-span-4 truncate text-xs text-red-300">
            ⚠️ {mov.reason ?? "Baja"}
          </div>
          <div className="col-span-2 text-right font-mono text-xs text-slate-300">
            {qty.toFixed(0)} aves
          </div>
          <div className="col-span-2 text-right font-mono text-xs text-slate-300">
            {kgVendidos.toFixed(2)} kg
          </div>
          <div className="col-span-2 text-right">
            <button
              type="button"
              onClick={() => onEdit(mov)}
              className="rounded bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400"
            >
              Editar
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="col-span-2 truncate text-xs text-slate-400">
          {formatHumanDate(mov.date, "short")}
        </div>
        <div className="col-span-3 truncate text-xs text-white">
          {mov.concept ?? mov.clientName ?? "Venta directa"}
        </div>
        <div className="col-span-1 text-right font-mono text-xs text-slate-300">
          {qty.toFixed(0)} aves
        </div>
        <div className="col-span-1 text-right font-mono text-xs text-white">
          {kgVendidos.toFixed(2)} kg
        </div>
        <div className="col-span-1 text-right font-mono text-xs text-slate-500">
          {kgEnviados.toFixed(2)} kg
        </div>
        <div className="col-span-1 text-right font-mono text-xs text-slate-300">
          {qty > 0 ? (kgVendidos / qty).toFixed(3) : "-"}
        </div>
        <div
          className={`col-span-1 text-right font-mono text-xs ${
            difKg < 0 ? "text-orange-400" : "text-green-400"
          }`}
        >
          {difKg > 0 ? "+" : ""}
          {difKg.toFixed(2)}
        </div>
        <div className="col-span-1 text-right font-mono text-xs text-white">
          {Number(mov.saleTotal ?? 0) > 0
            ? formatMXN(Number(mov.saleTotal))
            : "-"}
        </div>
        <div className="col-span-1 text-right">
          <button
            type="button"
            onClick={() => onEdit(mov)}
            className="rounded bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400"
          >
            Editar
          </button>
        </div>
      </>
    );
  };

  const renderHeaderColumns = () => (
    <>
      <div className="col-span-2 px-3 text-[10px] tracking-wider text-slate-500 uppercase">
        Fecha
      </div>
      <div className="col-span-3 text-[10px] tracking-wider text-slate-500 uppercase">
        Cliente
      </div>
      <div className="col-span-1 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        Aves
      </div>
      <div className="col-span-1 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        KG vend.
      </div>
      <div className="col-span-1 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        KG env.
      </div>
      <div className="col-span-1 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        Kg/Pollo
      </div>
      <div className="col-span-1 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        Dif KG
      </div>
      <div className="col-span-1 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        $ Total
      </div>
      <div className="col-span-1 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        Acción
      </div>
    </>
  );

  const renderOtherBatchHeader = () => (
    <>
      <div className="col-span-3 px-2 text-[10px] tracking-wider text-slate-500 uppercase">
        Lote
      </div>
      <div className="col-span-3 text-[10px] tracking-wider text-slate-500 uppercase">
        Cliente
      </div>
      <div className="col-span-2 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        KG vend.
      </div>
      <div className="col-span-2 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        KG env.
      </div>
      <div className="col-span-2 text-right text-[10px] tracking-wider text-slate-500 uppercase">
        $ Total
      </div>
    </>
  );

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        if (group.isSingleSale) {
          return (
            <div
              key={group.key}
              className="rounded-xl border border-slate-700/70 bg-slate-900/40"
            >
              <div className="grid grid-cols-12 items-center gap-2 border-b border-slate-800/60 bg-slate-950/40 px-3 py-1.5">
                {renderHeaderColumns()}
              </div>
              {group.movements.map((mov) => (
                <div
                  key={`${mov.type}-${mov.id}`}
                  className="grid grid-cols-12 items-center gap-2 px-3 py-1.5 text-sm"
                >
                  {renderSaleColumns(mov, false)}
                </div>
              ))}
            </div>
          );
        }
        return (
          <TripInlineRow
            key={group.key}
            unitType={tripsUnitType}
            currentBatchId={batchId}
            group={group}
            onEditMovement={onEdit}
            renderSaleColumns={renderSaleColumns}
            renderHeaderColumns={renderHeaderColumns}
            renderOtherBatchHeader={renderOtherBatchHeader}
          />
        );
      })}
    </div>
  );
};
