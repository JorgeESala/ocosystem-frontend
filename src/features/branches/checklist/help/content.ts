export interface MetricHelp {
  id: string;
  title: string;
  weight: string;
  description: string;
  formula: string;
  example: string;
  factors: string[];
  tips: string[];
}

export interface TaskHelp {
  id: string;
  title: string;
  icon: string;
  description: string;
  when: string;
  how: string;
}

export const METRIC_HELP: Record<string, MetricHelp> = {
  CHECKLIST: {
    id: "CHECKLIST",
    title: "Checklist diario",
    weight: "50%",
    description:
      "Mide si se completaron las tareas operativas del día en cada sucursal.",
    formula: "Puntaje = (Tareas completadas / Tareas esperadas) × 100",
    example:
      "Lunes: 4 tareas evaluadas, 3 hechas = 75%\nMartes: 2 tareas evaluadas, 2 hechas = 100%\nPromedio del período = 87.5%",
    factors: [
      "Subir reporte de ventas (todos los días)",
      "Registrar gastos (solo días programados)",
      "Registrar ventas (todos los días)",
      "Registrar entradas (solo días de remesa)",
      "Revisar cuentas por pagar (solo días programados)",
    ],
    tips: [
      "Sube el reporte de ventas todos los días antes del cierre",
      "Registra gastos y entradas en los días que corresponden según la rutina",
      "Si una tarea no aplica ese día, se marca como N/A y no afecta el puntaje",
    ],
  },
  SALES_GROWTH: {
    id: "SALES_GROWTH",
    title: "Ventas vs período anterior",
    weight: "30%",
    description:
      "Compara las ventas del período actual con el período anterior del mismo tamaño.",
    formula: "Puntaje = 50 + (crecimiento × 50)",
    example:
      "Semana pasada: $10,000\nEsta semana: $12,000\nCrecimiento: 20%\nPuntaje: 50 + 20 = 70%",
    factors: ["Ventas del período actual", "Ventas del período anterior"],
    tips: [
      "Un crecimiento del 100% o más da puntaje de 100%",
      "Sin crecimiento (0%) da puntaje de 50%",
      "Ventas negativas reducen el puntaje por debajo de 50%",
    ],
  },
  ACCOUNTS_PAYABLE: {
    id: "ACCOUNTS_PAYABLE",
    title: "Cuentas por pagar",
    weight: "20%",
    description:
      "Evalúa qué tan saludable es la situación de deudas de la sucursal comparada con las demás.",
    formula: "Puntaje = (Volumen + Frescura) / 2",
    example:
      "Deuda: $5,000\nDeuda más antigua: 30 días\np75 del grupo: $15,000\nVolumen: 67% | Frescura: 67%\nPuntaje: 67%",
    factors: [
      "Monto total de deudas abiertas (comparado con el p75 del grupo)",
      "Antigüedad de la deuda más vieja (techo: 90 días)",
    ],
    tips: [
      "Mantén las deudas bajas para mejorar el volumen",
      "Paga las cuentas más antiguas primero para mejorar la frescura",
      "Sin cuentas por pagar abiertas = puntaje de 100%",
    ],
  },
};

export const TASK_HELP: Record<string, TaskHelp> = {
  UPLOAD_SALES_REPORT: {
    id: "UPLOAD_SALES_REPORT",
    title: "Subir reporte de ventas",
    icon: "📄",
    description: "Cargar el archivo de corte de ventas del día al sistema.",
    when: "Todos los días, antes del cierre",
    how: 'Ve a "Subir Reportes" y selecciona el archivo de ventas del día.',
  },
  REGISTER_EXPENSES: {
    id: "REGISTER_EXPENSES",
    title: "Registrar gastos",
    icon: "💰",
    description: "Registrar todos los gastos operativos del día.",
    when: "Solo en días programados (rutina)",
    how: 'Ve a "Gastos" y registra cada gasto con su categoría y monto.',
  },
  REGISTER_SALES: {
    id: "REGISTER_SALES",
    title: "Registrar ventas",
    icon: "📦",
    description: "Registrar las ventas del día en el sistema.",
    when: "Todos los días",
    how: 'Ve a "Entradas y Ventas" y registra las ventas del día.',
  },
  REGISTER_ENTRIES: {
    id: "REGISTER_ENTRIES",
    title: "Registrar entradas",
    icon: "🚚",
    description: "Registrar la mercancía (remesa) que llegó a la sucursal.",
    when: "Solo en días de remesa (rutina)",
    how: 'Ve a "Entradas y Ventas" y registra la entrada de la remesa.',
  },
  REVIEW_ACCOUNTS_PAYABLE: {
    id: "REVIEW_ACCOUNTS_PAYABLE",
    title: "Revisar cuentas por pagar",
    icon: "✅",
    description:
      "Revisar y actualizar el estado de las cuentas por pagar abiertas.",
    when: "Solo en días programados (rutina)",
    how: 'Ve a "Contabilidad" y revisa cada cuenta pendiente. Marca las que ya fueron revisadas.',
  },
};

export const GENERAL_HELP = {
  title: "Cómo funciona el sistema de calificación",
  sections: [
    {
      title: "¿Qué es esto?",
      content:
        "El sistema mide qué tan bien está funcionando cada sucursal. Hay 3 indicadores que se combinan en un puntaje general, como una calificación escolar para cada sucursal.",
    },
    {
      title: "¿Cómo se califica cada tarea?",
      content:
        "Cada tarea tiene uno de tres estados: HECHO (100 puntos), PENDIENTE (0 puntos), o N/A (se ignora si la tarea no aplica ese día). Las tareas se evalúan según las rutinas configuradas para cada sucursal.",
    },
    {
      title: "¿Qué son las rutinas?",
      content:
        "Las rutinas definen qué tareas se esperan en cada día de la semana. Por ejemplo, si una sucursal recibe remesa los lunes y miércoles, solo esos días se evalúa la tarea de entradas. Esto hace que el sistema sea justo: no se penaliza por tareas que no corresponden.",
    },
    {
      title: "¿Cómo se calcula el puntaje general?",
      content:
        "Puntaje = (Checklist × 50%) + (Ventas × 30%) + (Cuentas por pagar × 20%). Cada indicador se mide en porcentaje y se combina con estos pesos.",
    },
  ],
};

export const FAQ_HELP = [
  {
    q: "¿Por qué mi sucursal tiene puntaje bajo si trabajo mucho?",
    a: "El puntaje no mide esfuerzo, mide resultados en el sistema. Puede que se estén haciendo tareas pero no en los días correctos, o que falten datos. Revisa que todas las tareas estén registradas.",
  },
  {
    q: "¿Qué pasa si no subo un reporte un día?",
    a: "Ese día penaliza tu checklist. Si fue un error, sube el reporte lo antes posible y el puntaje se recalculará.",
  },
  {
    q: "¿Las rutinas se pueden cambiar?",
    a: "Sí. Un administrador puede crear, modificar o eliminar rutinas desde el calendario de fechas esperadas.",
  },
  {
    q: "¿Por qué la deuda afecta mi puntaje?",
    a: "El sistema mide la salud financiera de cada sucursal. Mantener deudas bajo control es parte del buen manejo. No es un castigo, es una medición comparativa.",
  },
  {
    q: "¿Qué es el p75?",
    a: "Es el nivel de deuda del 25% peor del grupo. Se usa para comparar tu sucursal contra las demás de forma justa, adaptándose al contexto del negocio.",
  },
];
