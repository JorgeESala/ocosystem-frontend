import { Badge } from "flowbite-react";
import type { AbcClass } from "../utils/productMetrics";

const COLORS: Record<AbcClass, string> = {
  A: "border border-green-500/40 bg-green-900/30 text-green-400",
  B: "border border-yellow-500/40 bg-yellow-900/30 text-yellow-400",
  C: "border border-gray-500/40 bg-gray-700/40 text-gray-300",
};

const TITLES: Record<AbcClass, string> = {
  A: "Clase A: producto clave, parte del 80% de la venta.",
  B: "Clase B: venta media, completa hasta el 95%.",
  C: "Clase C: baja rotación, el resto de la venta.",
};

export const AbcBadge = ({ value }: { value: AbcClass }) => (
  <Badge className={`w-fit ${COLORS[value]}`} title={TITLES[value]}>
    {value}
  </Badge>
);
