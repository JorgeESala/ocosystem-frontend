import { Button, Spinner, TextInput } from "flowbite-react";
import { HiClock, HiPencilAlt, HiRefresh } from "react-icons/hi";
import { formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import type { EggPriceReferenceDTO } from "../types/routeOrder.types";

interface Props {
  current: EggPriceReferenceDTO | null | undefined;
  isLoading: boolean;
  routePrice: string;
  onRoutePriceChange: (value: string) => void;
  onApplyRoutePrice: () => void;
  onOpenUpdate: () => void;
  onOpenHistory: () => void;
}

export const EggPriceReferenceCard: React.FC<Props> = ({
  current,
  isLoading,
  routePrice,
  onRoutePriceChange,
  onApplyRoutePrice,
  onOpenUpdate,
  onOpenHistory,
}) => (
  <div className="rounded-2xl border border-amber-700/40 bg-amber-950/20 p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-amber-300/80 uppercase">
          Precio actual del huevo
        </p>
        {isLoading ? (
          <div className="mt-2">
            <Spinner size="sm" />
          </div>
        ) : current ? (
          <>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatMXN(current.pricePerCarton)} por casillero
              <span className="ml-2 text-sm font-normal text-amber-200/80">
                ({formatMXN(current.pricePerBox)} por caja)
              </span>
            </p>
            <p className="text-xs text-amber-200/60">
              Vigente desde {formatHumanDate(current.effectiveFrom, "short")}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-amber-200/70">
            No hay precio actual definido para esta fecha.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="xs" color="light" onClick={onOpenUpdate}>
          <HiPencilAlt className="mr-1 h-4 w-4" />
          Actualizar precio
        </Button>
        <Button size="xs" color="light" onClick={onOpenHistory}>
          <HiClock className="mr-1 h-4 w-4" />
          Historial
        </Button>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-amber-900/40 pt-3">
      <div>
        <label
          htmlFor="route-price"
          className="mb-1 block text-xs text-amber-200/70"
        >
          Precio para esta ruta (por casillero)
        </label>
        <TextInput
          id="route-price"
          type="number"
          sizing="sm"
          min="0"
          step="0.01"
          value={routePrice}
          onChange={(event) => onRoutePriceChange(event.target.value)}
          className="w-40"
        />
      </div>
      <Button size="sm" color="warning" onClick={onApplyRoutePrice}>
        <HiRefresh className="mr-1 h-4 w-4" />
        Aplicar a la ruta
      </Button>
      <p className="text-[11px] text-amber-200/50">
        Puedes ajustar el precio de cada cliente en la tabla.
      </p>
    </div>
  </div>
);
