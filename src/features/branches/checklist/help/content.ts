export interface MetricHelp {
  id: string;
  title: string;
  description: string;
  formula: string;
  factors: string[];
  tips: string[];
}

export interface TaskHelp {
  id: string;
  title: string;
  description: string;
  when: string;
  who: string;
  how: string;
}

export const METRIC_HELP: Record<string, MetricHelp> = {
  CHECKLIST: {
    id: "CHECKLIST",
    title: "Checklist Diario",
    description:
      "Mide el cumplimiento de las tareas operativas diarias de cada sucursal.",
    formula: "Puntaje = (Tareas completadas / Tareas esperadas) × 100",
    factors: [
      "Subir reporte de ventas",
      "Registrar gastos",
      "Registrar entradas y ventas",
      "Revisar cuentas por pagar",
    ],
    tips: [
      "Completa todas las tareas antes del cierre del día",
      "Si una tarea no aplica, se marca como no evaluable y no afecta el puntaje",
      "El puntaje semanal es el promedio de los puntajes diarios",
    ],
  },
  SALES_GROWTH: {
    id: "SALES_GROWTH",
    title: "Ventas vs Periodo Anterior",
    description:
      "Compara las ventas del periodo actual con el periodo anterior del mismo tamaño.",
    formula:
      "Crecimiento = ((Ventas actuales - Ventas anteriores) / Ventas anteriores) × 100\nPuntaje = clamp(0, 100, base + crecimiento × multiplicador)",
    factors: [
      "Ventas del periodo actual",
      "Ventas del periodo anterior",
      "Base (valor por defecto: 50)",
      "Multiplicador (valor por defecto: 50)",
    ],
    tips: [
      "Un crecimiento del 100% da un puntaje de 100",
      "Sin crecimiento (0%) da un puntaje de 50",
      "Ventas negativas reducen el puntaje",
      "Los parámetros base y multiplicador pueden ser ajustados por un administrador",
    ],
  },
  ACCOUNTS_PAYABLE: {
    id: "ACCOUNTS_PAYABLE",
    title: "Cuentas por Pagar",
    description:
      "Evalúa el monto y antigüedad de las cuentas por pagar abiertas.",
    formula:
      "Volumen = 100 × (1 - clamp(0, p75, deuda) / p75)\nFrescura = 100 × (1 - clamp(0, umbral, antigüedad) / umbral)\nPuntaje = (Volumen + Frescura) / 2",
    factors: [
      "Monto total de cuentas por pagar abiertas",
      "Antigüedad de la cuenta más vieja (en días)",
      "Percentil 75 de deuda de todas las sucursales",
      "Umbral de frescura (valor por defecto: 90 días)",
    ],
    tips: [
      "Mantén las cuentas por pagar bajas para mejorar el volumen",
      "Paga las cuentas más antiguas primero para mejorar la frescura",
      "Sin cuentas por pagar da un puntaje de 100",
      "El umbral de frescura puede ser ajustado por un administrador",
    ],
  },
};

export const TASK_HELP: Record<string, TaskHelp> = {
  UPLOAD_SALES_REPORT: {
    id: "UPLOAD_SALES_REPORT",
    title: "Subir Reporte de Ventas",
    description: "Subir el archivo de ventas del día al sistema.",
    when: "Diariamente, antes del cierre del día",
    who: "Encargado de la sucursal",
    how: 'Ve a la sección "Subir Reportes" y selecciona el archivo de ventas del día',
  },
  REGISTER_EXPENSES: {
    id: "REGISTER_EXPENSES",
    title: "Registrar Gastos",
    description: "Registrar todos los gastos operativos del día.",
    when: "Diariamente, cuando se presenten gastos",
    who: "Encargado de la sucursal",
    how: 'Ve a la sección "Gastos" y registra cada gasto con su categoría y monto',
  },
  REGISTER_SALES_AND_ENTRIES: {
    id: "REGISTER_SALES_AND_ENTRIES",
    title: "Registrar Entradas y Ventas",
    description: "Registrar las ventas del día y las entradas de remesas.",
    when: "Diariamente, al final del día",
    who: "Encargado de la sucursal",
    how: 'Ve a la sección "Ventas y Remesas" y registra cada venta y entrada',
  },
  REVIEW_ACCOUNTS_PAYABLE: {
    id: "REVIEW_ACCOUNTS_PAYABLE",
    title: "Revisar Cuentas por Pagar",
    description: "Revisar y actualizar el estado de las cuentas por pagar.",
    when: "Semanalmente o cuando haya cuentas pendientes",
    who: "Encargado de la sucursal",
    how: 'Ve a la sección "Cuentas por Pagar" y revisa cada cuenta pendiente',
  },
};

export const GENERAL_HELP = {
  title: "Cómo usar el Checklist Diario",
  sections: [
    {
      title: "¿Qué es el Checklist Diario?",
      content:
        "El Checklist Diario es una herramienta que mide el cumplimiento operativo de cada sucursal. Evalúa tres indicadores principales: el checklist de tareas diarias, el crecimiento de ventas comparado con el periodo anterior, y el estado de las cuentas por pagar.",
    },
    {
      title: "¿Cómo se calcula el puntaje general?",
      content:
        "El puntaje general es un promedio ponderado de los tres indicadores. Cada indicador tiene un peso que puede ser ajustado por un administrador. Los pesos por defecto son: Checklist (50%), Ventas (30%), Cuentas por Pagar (20%).",
    },
    {
      title: "¿Qué significa cada color?",
      content:
        "Verde (80-100%): Excelente desempeño. Amarillo (60-79%): Desempeño aceptable, hay oportunidad de mejora. Rojo (0-59%): Desempeño bajo, se requiere atención inmediata.",
    },
    {
      title: "¿Cómo mejorar mi puntaje?",
      content:
        "Completa todas las tareas del checklist diariamente, mantén un crecimiento positivo en ventas comparado con el periodo anterior, y mantén las cuentas por pagar bajas y actualizadas.",
    },
    {
      title: "¿Qué es el desglose diario?",
      content:
        "Al hacer clic en una fila de sucursal, puedes ver el desglose diario que muestra qué tareas se completaron cada día y quién fue el encargado ese día. Esto te ayuda a identificar patrones y áreas de mejora.",
    },
  ],
};
