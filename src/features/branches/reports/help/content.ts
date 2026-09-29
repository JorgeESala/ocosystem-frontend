export interface HelpMetric {
  id: string;
  title: string;
  description: string;
  details: string[];
}

export interface HelpSection {
  id: string;
  title: string;
  content: string;
}

export interface HelpFaqItem {
  q: string;
  a: string;
}

export const REPORTS_INTRO =
  "Este reporte trabaja de lo general a lo particular: primero el consolidado de todas las sucursales, luego el ranking, después el detalle de una sucursal y al final la información por producto.";

export const REPORTS_METRICS: HelpMetric[] = [
  {
    id: "venta-real",
    title: "Venta Real",
    description:
      "Suma de las ventas al público del periodo. No incluye Merma ni Matados.",
    details: [
      "Las cancelaciones se restan del total.",
      "Es la base del ticket promedio y de la participación por sucursal.",
    ],
  },
  {
    id: "pollo-beneficiado",
    title: "Pollo Beneficiado",
    description: "Piezas registradas en la categoría Matados.",
    details: [
      "Sirve para comparar producción contra venta.",
      "El promedio por día se calcula sobre los días con reporte.",
    ],
  },
  {
    id: "ticket-promedio",
    title: "Ticket Promedio",
    description: "Venta Real dividida entre los tickets reales del periodo.",
    details: [
      "Solo cuenta tickets con al menos una venta real.",
      "Sube cuando los clientes agregan complementos al pollo.",
    ],
  },
  {
    id: "perdida-neta",
    title: "Pérdida Neta (Merma)",
    description:
      "Merma registrada sin contar la tripa, que es merma operativa.",
    details: [
      "La nota bajo el número muestra la merma total del periodo.",
      "Un incremento respecto al periodo anterior se marca en rojo.",
    ],
  },
  {
    id: "sucursales-reportando",
    title: "Sucursales Reportando",
    description:
      "Sucursales con al menos un día de reporte dentro del periodo.",
    details: [
      "Si una sucursal no reporta, no se cuenta como venta en cero.",
      "El aviso de cobertura lista las sucursales sin reporte o con días faltantes.",
    ],
  },
];

export const REPORTS_SECTIONS: HelpSection[] = [
  {
    id: "flujo",
    title: "Cómo moverse en el reporte",
    content:
      "Empieza con los indicadores generales y la tendencia. Después revisa el ranking para ver qué sucursal aporta más y cuál se movió respecto al periodo anterior. Haz clic en una sucursal para abrir su detalle, y en cualquier producto del catálogo para ver cómo se vende en cada sucursal.",
  },
  {
    id: "cobertura",
    title: "Cobertura: sin reporte no es cero",
    content:
      "Los promedios solo consideran días con reporte. Si una sucursal no subió su reporte, esos días no cuentan como venta en cero. El aviso de cobertura te dice cuántas sucursales reportaron y cuáles tienen días faltantes.",
  },
  {
    id: "excluidas",
    title: "Sucursales excluidas",
    content:
      "En Desempeño → Sucursales excluidas se pueden marcar sucursales que no deben participar en los análisis. Reportes y Ganancias las ignoran por completo y muestran una nota con los nombres y motivos.",
  },
  {
    id: "cancelaciones",
    title: "Cancelaciones",
    content:
      "Las cancelaciones se restan de los totales. La matriz de productos y el detalle indican cuándo un producto incluye cancelaciones para que la diferencia no sorprenda.",
  },
  {
    id: "tops",
    title: "Productos estrella y catálogo",
    content:
      "Los tops nunca muestran Merma ni Matados. Con las casillas Ocultar en tops puedes esconder también pollo y huevo, que suelen ocupar los primeros lugares, y ver qué sigue. La búsqueda y el catálogo paginado permiten encontrar cualquier producto, aunque no esté en el top.",
  },
  {
    id: "merma",
    title: "¿De dónde sale la Pérdida Neta (merma)?",
    content:
      "La merma se separa en dos: la tripa, que es merma operativa, y el resto, que es la pérdida neta (lo que realmente se pierde). La tarjeta muestra la pérdida neta y debajo la merma total, que incluye la tripa. Haz clic en la tarjeta para ver el desglose por producto y por sucursal; desde ahí puedes abrir el detalle diario de cada producto.",
  },
  {
    id: "abc",
    title: "Clases ABC",
    content:
      "Sirve para ver rápido qué productos importan más. Se ordenan de mayor a menor venta: la clase A son los que juntos hacen el 80% de la venta (productos clave), la B los que llevan el acumulado al 95% (venta media) y la C el resto (baja rotación). Ejemplo: si con 5 productos ya cubres el 80% del periodo, esos 5 son A; los siguientes que llegan al 95% son B; el resto, C. Se calcula con todo el catálogo del periodo, sin Merma ni Matados, y no cambia al buscar ni al paginar: solo cambia si ocultas pollo o huevo en Ocultar en tops.",
  },
  {
    id: "periodos",
    title: "Comparación de periodos",
    content:
      "Los porcentajes de cambio comparan contra la ventana anterior de la misma duración. Por ejemplo, una semana contra la semana inmediata anterior.",
  },
];

export const REPORTS_FAQ: HelpFaqItem[] = [
  {
    q: "¿Por qué el total no coincide con lo que veo en otra pantalla?",
    a: "Revisa si el periodo incluye días sin reporte, si hay sucursales excluidas en Desempeño o si las casillas para ocultar pollo/huevo están activas. Los indicadores y el ranking siempre incluyen todas las sucursales activas.",
  },
  {
    q: "¿Por qué no encuentro un producto en el top?",
    a: "Los tops excluyen Merma y Matados, y puedes estar ocultando pollo o huevo. Usa la búsqueda o el catálogo para localizarlo.",
  },
  {
    q: "¿De dónde salen los datos?",
    a: "De los reportes de punto de venta que se suben en Subir reporte o que envía la aplicación de sucursal. Cada reporte se agrega por sucursal y día.",
  },
  {
    q: "¿Por qué una sucursal no aparece por ningún lado?",
    a: "Probablemente está excluida en Desempeño → Sucursales excluidas. La nota superior del reporte muestra las sucursales excluidas y el motivo.",
  },
  {
    q: "¿Qué significa 'incluye cancelaciones'?",
    a: "Que en el periodo hubo cancelaciones para ese producto, y ya están restadas del total.",
  },
];
