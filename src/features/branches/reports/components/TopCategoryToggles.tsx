import { Checkbox } from "flowbite-react";
import { InfoTip } from "@/components/InfoTip";

interface Props {
  hideChicken: boolean;
  hideEgg: boolean;
  onChange: (hideChicken: boolean, hideEgg: boolean) => void;
  className?: string;
}

export const TopCategoryToggles = ({
  hideChicken,
  hideEgg,
  onChange,
  className = "",
}: Props) => (
  <div className={`flex flex-wrap items-center gap-4 ${className}`}>
    <span className="text-xs font-medium text-gray-400">Ocultar en tops:</span>
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-200">
      <Checkbox
        checked={hideChicken}
        onChange={(event) => onChange(event.target.checked, hideEgg)}
      />
      Pollo
    </label>
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-200">
      <Checkbox
        checked={hideEgg}
        onChange={(event) => onChange(hideChicken, event.target.checked)}
      />
      Huevo
    </label>
    <InfoTip title="Tops sin pollo/huevo">
      El pollo y el huevo son los principales vendedores y suelen ocupar los
      primeros lugares. Actívalos para ocultarlos de Productos Estrella, la
      matriz, el catálogo y el rendimiento por producto y ver qué sigue en la
      lista. Los totales, el ranking y la mezcla por categoría no cambian. La
      preferencia se recuerda en este equipo.
    </InfoTip>
  </div>
);
