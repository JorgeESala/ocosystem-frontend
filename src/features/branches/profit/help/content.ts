export interface ProfitHelpMetric {
  id: string;
  title: string;
  description: string;
  details: string[];
}

export interface ProfitHelpFaqItem {
  q: string;
  a: string;
}

export const PROFIT_INTRO =
  "Ganancias calcula la utilidad de cada sucursal a partir de las ventas de remesa, el costo prorrateado del pollo y los gastos registrados en el periodo.";

export const PROFIT_METRICS: ProfitHelpMetric[] = [
  {
    id: "ventas",
    title: "Ventas",
    description: "Total de las ventas de remesa de las sucursales del periodo.",
    details: [
      "Si una venta no trae monto, se estima con los kilos y el precio por kilo de la remesa.",
    ],
  },
  {
    id: "gastos",
    title: "Gastos",
    description: "Suma de los gastos registrados por las sucursales del periodo.",
    details: [
      "La auditoría de gastos permite verlos por categoría, sucursal o movimiento.",
    ],
  },
  {
    id: "costo-pollo",
    title: "Costo de pollo",
    description:
      "Costo prorrateado: los kilos vendidos por el precio por kilo de la remesa.",
    details: [
      "Solo se carga a la utilidad la parte de la remesa que se vendió en el rango.",
    ],
  },
  {
    id: "utilidad",
    title: "Utilidad Neta",
    description: "Ventas menos costo de pollo y menos gastos del periodo.",
    details: [
      "Puede ser negativa si los gastos superan la venta.",
      "El margen y las razones comparan contra las ventas del periodo.",
    ],
  },
  {
    id: "efectivo",
    title: "Efectivo Esperado",
    description:
      "Ventas menos gastos: lo que debería haber quedado en caja antes de otros movimientos.",
    details: [
      "El desglose por unidad de negocio separa el efectivo por tipo de gasto.",
    ],
  },
  {
    id: "conciliacion",
    title: "Importado vs manual",
    description:
      "Compara el pollo vendido según los reportes de punto de venta contra las ventas de remesa capturadas en el sistema.",
    details: [
      "Las diferencias altas son señal de un reporte faltante o de capturas distintas.",
    ],
  },
];

export const PROFIT_FAQ: ProfitHelpFaqItem[] = [
  {
    q: "¿Por qué la utilidad no coincide con la caja del día?",
    a: "La utilidad es un cálculo del periodo (ventas, costo prorrateado y gastos) y no incluye movimientos de caja como retiros, aportaciones o préstamos. Para eso existe Caja general.",
  },
  {
    q: "¿Por qué aparece 'sin comparativo' en una sucursal?",
    a: "No hubo ventas o datos en el periodo anterior; el cambio no se puede calcular.",
  },
  {
    q: "¿Por qué una sucursal no aparece en el selector?",
    a: "Está excluida en Desempeño → Sucursales excluidas. Ganancias la ignora igual que Reportes.",
  },
  {
    q: "¿Qué hago si la conciliación marca diferencia?",
    a: "Revisa si todos los días tienen reporte subido y si las ventas de remesa se capturaron completas. El aviso se expande por fecha para ubicar el día exacto.",
  },
];
