import React from "react";
import { Tooltip as FlowbiteTooltip } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

export const ClientRouteHelpContent = () => (
  <div className="max-w-xs space-y-1.5 text-left text-xs leading-snug text-gray-100">
    <p className="font-semibold text-white">¿Cómo se asigna la ruta?</p>
    <p>
      La ruta se asigna por la localidad del cliente: si su localidad está
      cubierta por una ruta, el cliente aparece automáticamente en ella. No se
      asigna cliente por cliente.
    </p>
    <p>
      Si su localidad está cubierta por varias rutas, el cliente pertenece a
      todas.
    </p>
    <p>
      Si no tiene localidad, o ninguna ruta cubre su localidad, aparece como{" "}
      <span className="font-semibold text-white">Sin ruta</span>.
    </p>
  </div>
);

export const RouteLocalitiesHelpContent = () => (
  <div className="max-w-xs space-y-1.5 text-left text-xs leading-snug text-gray-100">
    <p className="font-semibold text-white">
      ¿Cómo se asignan las localidades?
    </p>
    <p>Cada ruta cubre una o varias localidades.</p>
    <p>
      Una localidad puede estar en varias rutas; los clientes de esa localidad
      aparecerán en todas ellas.
    </p>
    <p>
      Los clientes se agrupan por localidad, así que mantener las localidades al
      día mantiene las rutas correctas.
    </p>
  </div>
);

export const RouteDeliveryDaysHelpContent = () => (
  <div className="max-w-xs space-y-1.5 text-left text-xs leading-snug text-gray-100">
    <p className="font-semibold text-white">
      ¿Qué significan los días de entrega?
    </p>
    <p>
      Son los días de la semana (Lun a Dom) en que opera la ruta. Se usan como
      referencia para planear entregas y compras.
    </p>
    <p>Por ahora no generan tareas ni entregas automáticas.</p>
  </div>
);

export const RouteProfitabilityHelpContent = () => (
  <div className="max-w-xs space-y-1.5 text-left text-xs leading-snug text-gray-100">
    <p className="font-semibold text-white">¿Cómo se calcula la utilidad?</p>
    <p className="font-medium text-white">
      Utilidad = Ventas − Costo de remesa − Combustible
    </p>
    <p>
      El costo es el total de la remesa repartido entre las piezas o kilos
      vendidos de esa remesa (prorrateo).
    </p>
    <p>
      Si la remesa no tiene peso o cantidad registrada, el costo aparece en $0 y
      el margen se ve más alto de lo real.
    </p>
    <p>Todavía no incluye la nómina de choferes; llegará más adelante.</p>
  </div>
);

export const ClientHistoryHelpContent = () => (
  <div className="max-w-xs space-y-1.5 text-left text-xs leading-snug text-gray-100">
    <p className="font-semibold text-white">¿Qué muestra el historial?</p>
    <p>
      El resumen de compras del cliente en el rango: ventas totales, cantidad
      vendida, número de compras y la fecha de su última compra.
    </p>
    <p>
      La cantidad se muestra en cajas, casilleros y piezas para huevo, y en aves
      para pollo vivo.
    </p>
    <p>
      Solo incluye ventas registradas con cliente; las ventas "Sin ruta" o sin
      cliente no aparecen.
    </p>
  </div>
);

export const SummaryKpiHelpContent = () => (
  <div className="max-w-xs space-y-1.5 text-left text-xs leading-snug text-gray-100">
    <p className="font-semibold text-white">¿Qué significan estos números?</p>
    <p>
      Ventas, utilidad y margen del periodo comparados contra el periodo
      anterior de la misma duración (↑ subió, ↓ bajó).
    </p>
    <p>
      Ticket promedio = ventas ÷ número de ventas. Top 10 clientes = porcentaje
      de las ventas que concentran tus 10 clientes más grandes.
    </p>
    <p>
      El costo viene del prorrateo de la remesa y el combustible de los gastos
      de esa ruta. Si una remesa no tiene peso o cantidad registrada, su costo
      aparece en $0.
    </p>
  </div>
);

export const SummaryAttentionHelpContent = () => (
  <div className="max-w-xs space-y-1.5 text-left text-xs leading-snug text-gray-100">
    <p className="font-semibold text-white">Necesitan atención</p>
    <p>
      Sin ruta: su localidad no está cubierta por ninguna ruta activa. Sin
      localidad: no tienen localidad registrada.
    </p>
    <p>
      Dormidos: compraron alguna vez, pero no en los últimos días del selector.
      Nunca han comprado: no tienen ninguna venta registrada.
    </p>
    <p>
      Rutas sin actividad: no vendieron en el periodo. Sin localidades: no
      cubren ninguna localidad todavía.
    </p>
  </div>
);

interface InfoTooltipProps {
  label: string;
  content: React.ReactNode;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ label, content }) => (
  <FlowbiteTooltip content={content} placement="top" style="dark" arrow>
    <HiInformationCircle
      className="inline cursor-help text-gray-400 hover:text-gray-200"
      size={14}
      aria-label={label}
      role="img"
    />
  </FlowbiteTooltip>
);
