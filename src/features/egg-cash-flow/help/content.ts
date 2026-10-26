export interface HelpStep {
  title: string;
  description: string;
}

export interface HelpBag {
  id: string;
  title: string;
  description: string;
  enters: string[];
  leaves: string[];
}

export interface HelpSection {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
}

export interface HelpFaq {
  q: string;
  a: string;
}

export interface HelpGlossaryItem {
  term: string;
  definition: string;
}

export const CASH_FLOW_INTRO =
  "El Flujo de efectivo de huevo responde una sola pregunta: dónde está el dinero. Tiene dos bolsas propias, caja chica (el efectivo de la oficina) y banco (la cuenta del titular). No reemplaza la caja general ni el Estado de resultados: esas vistas muestran el efectivo registrado; este módulo muestra el efectivo físico separado por bolsa y lo cierra cada semana con un corte.";

export const FIRST_STEPS: HelpStep[] = [
  {
    title: "1. Configura tus saldos iniciales",
    description:
      "Abre Configurar y captura el efectivo inicial de caja chica, el saldo inicial del banco, el titular de la cuenta y la fecha desde la que quieres llevar el flujo. Ahí mismo marcas a los clientes que depositan directo al banco.",
  },
  {
    title: "2. Revisa lo que ya entró solo",
    description:
      "Los cobros de sucursales y clientes con cuenta, los gastos de Gastos y los pagos de remesa hechos desde este módulo entran automáticamente. En “Por cobrar” ves lo que el ERP todavía no tiene registrado en el flujo.",
  },
  {
    title: "3. Registra el efectivo de ruta",
    description:
      "Cuando el chofer entrega el efectivo del despacho, usa “Ingreso” con la fuente Despacho (ruta). El monto puede no coincidir con las ventas registradas: captura lo que realmente entregó.",
  },
  {
    title: "4. Registra el depósito",
    description:
      "Cuando lleves efectivo de caja chica al banco, usa “Depósito”. Mueve las dos bolsas al mismo tiempo: sale de caja chica y entra al banco.",
  },
  {
    title: "5. Paga las remesas",
    description:
      "En “Remesas por pagar” elige la deuda y registra el pago desde banco (o caja chica). El pago queda aplicado en Contabilidad y baja la deuda.",
  },
  {
    title: "6. Cierra la semana",
    description:
      "Elige el rango de la semana, revisa que no falte nada, captura el saldo real del banco y de caja chica y usa “Corte de semana”. La semana queda bloqueada; si algo faltó, reabre el último corte, corrige y vuelve a cortar.",
  },
];

export const BAGS: HelpBag[] = [
  {
    id: "cash",
    title: "Caja chica",
    description: "El efectivo que está en la oficina.",
    enters: [
      "Cobros de sucursales y clientes con cuenta.",
      "Efectivo de ruta y clientes en efectivo.",
      "Otros ingresos y ajustes de entrada.",
    ],
    leaves: [
      "Gastos en efectivo.",
      "Pagos de remesa desde caja chica.",
      "Depósitos al banco.",
    ],
  },
  {
    id: "bank",
    title: "Banco",
    description: "La cuenta del titular.",
    enters: [
      "Depósitos desde caja chica.",
      "Cobros de clientes marcados como depósito directo.",
    ],
    leaves: ["Pagos de remesa desde banco.", "Ajustes de salida."],
  },
];

export const AUTOMATIC_ITEMS: string[] = [
  "Cobros de sucursales y clientes con cuenta por cobrar (entran a caja chica).",
  "Cobros de clientes marcados como depósito directo (entran a banco).",
  "Gastos registrados en Gastos: gasolina, nómina, compras, llantas, recargas.",
  "Pagos de remesa hechos desde este módulo.",
  "El sistema usa la fecha del documento. Si cae en una semana cerrada no la modifica: reabre el último corte para corregir.",
];

export const MANUAL_ITEMS: string[] = [
  "Efectivo de ruta/despacho: lo que el chofer realmente entregó.",
  "Clientes en efectivo que no tienen cuenta por cobrar en el ERP.",
  "Depósitos de caja chica al banco.",
  "Ajustes de cuenta: diferencias, correcciones o dinero que no viene de un documento.",
  "El corte de semana y los saldos reales.",
];

export const PAGE_SECTIONS: HelpSection[] = [
  {
    id: "cards",
    title: "Tarjetas de arriba",
    paragraphs: [
      "Caja chica (saldo) es el efectivo que quedó en la oficina. Banco es el saldo calculado de la cuenta. Cobranza del periodo es el ingreso de caja chica del rango (incluye ajustes) y Total es la suma de caja chica y banco.",
      "La deuda con remesas aparece en la tarjeta Total. Es el saldo de las cuentas por pagar de proveedores, no la deuda con el gerente.",
    ],
  },
  {
    id: "summary",
    title: "Resumen semanal",
    paragraphs: [
      "Caja chica: apertura + cobranza − gastos − pagos de remesa ± ajustes − depósitos = cierre de caja chica.",
      "Banco: corte anterior + depósitos − pagos de remesa ± ajustes = corte de la semana. Abajo ves la deuda con remesas, el saldo real y la diferencia.",
    ],
  },
  {
    id: "movements",
    title: "Movimientos",
    paragraphs: [
      "Cada fila trae fecha, bolsa, dirección, categoría, monto, origen y nota. La etiqueta “Auto” indica que lo creó el sistema; si no la tiene, se capturó a mano.",
      "Puedes filtrar por Todas, Caja chica o Banco.",
    ],
  },
  {
    id: "cuts",
    title: "Cortes de semana",
    paragraphs: [
      "“Caja chica (ingreso)” es el efectivo que entró en la semana (la fila CAJA CHICA de tu hoja). “Cierre caja chica” es lo que quedó en la oficina después del depósito. “Banco” es el corte final de la cuenta.",
      "“Saldo real” y “Diferencia” comparan el saldo que capturaste contra el calculado.",
    ],
  },
  {
    id: "pending",
    title: "Por cobrar",
    paragraphs: [
      "Muestra documentos del ERP que aún no tienen movimiento en el flujo. Lo que ya registraste deja de aparecer; lo que queda son documentos fuera de tu hoja de control.",
      "“Registrar todo” registra los despachos pendientes de una vez.",
    ],
  },
];

export const CUT_STEPS: HelpStep[] = [
  {
    title: "1. Elige el rango de la semana",
    description:
      "Puede ser sábado–viernes como tu hoja, o el rango que uses. La página abre en la última semana con corte; el botón “Ver periodo de cortes” muestra todas.",
  },
  {
    title: "2. Revisa que no falte nada",
    description:
      "Compara movimientos, cobros pendientes y gastos. Si falta algo, regístralo antes de cortar.",
  },
  {
    title: "3. Captura los saldos reales",
    description:
      "Escribe el saldo real de la cuenta y el efectivo real en caja chica. La diferencia se calcula sola.",
  },
  {
    title: "4. Confirma el corte",
    description:
      "El sistema guarda apertura, cierre, ingresos, gastos, depósitos, remesas, deuda y saldos reales de la semana.",
  },
  {
    title: "5. La semana queda bloqueada",
    description:
      "No se pueden registrar movimientos con fecha dentro de la semana cerrada.",
  },
  {
    title: "6. Si algo faltó, reabre el último corte",
    description:
      "Solo el último corte se puede reabrir. Se borra el corte, la semana se desbloquea, corriges y vuelves a cortar. Los cortes anteriores no se pueden reabrir porque encadenan su apertura.",
  },
];

export const FIX_ITEMS: string[] = [
  "Movimiento equivocado: elimínalo desde la tabla (si la semana está abierta).",
  "Depósito equivocado: elimínalo; se borran las dos partes (caja chica y banco) y lo vuelves a registrar.",
  "Cobro en la bolsa equivocada: usa el botón de cambiar cuenta en la fila. Los depósitos no se mueven así: se eliminan y se re-registran.",
  "Dinero que no viene de un documento: usa “Ajuste” con la cuenta, dirección, fecha, monto y motivo.",
  "Semana cerrada: reabre el último corte, corrige y vuelve a cortar.",
  "Pago de remesa: no se puede eliminar desde el flujo porque está aplicado en Contabilidad. Cancélalo en Contabilidad y el flujo se revierte.",
];

export const REMESA_NOTES: string[] = [
  "La deuda con remesas del módulo es el saldo de las cuentas por pagar de proveedores (BATCH).",
  "El pago de remesa se registra desde este módulo, se aplica a la deuda y baja el saldo. Desde banco crea una salida de banco; desde caja chica, una salida de efectivo.",
  "La “deuda con Enrique” de tu hoja es otra deuda (con el gerente) y no se administra en este módulo. Por eso el número puede no coincidir.",
  "Si la deuda ya está pagada en Contabilidad, el módulo no permite pagarla otra vez.",
];

export const EXCEL_COMPARISON: HelpSection = {
  id: "sheet",
  title: "Cómo comparar con tu hoja de control",
  paragraphs: [
    "Tu hoja y el módulo ven el mismo dinero, pero con nombres distintos. Esta es la equivalencia:",
  ],
  items: [
    "Fila CAJA CHICA de tu hoja = columna “Caja chica (ingreso)” del corte y tarjeta “Cobranza del periodo”.",
    "Columna CORTE FINAL / saldo de la cuenta = columna “Banco” del corte.",
    "Columna “Cierre caja chica” = efectivo que quedó en la oficina después de depositar (puede ser 0).",
    "INGRESO A CUENTA de tu hoja = depósito de caja chica al banco.",
    "Deuda con Enrique de tu hoja ≠ “Deuda remesas (proveedores)” del módulo.",
    "Si tu hoja no incluye un documento que sí está en el ERP, aparecerá como pendiente en “Por cobrar” hasta que lo registres o lo dejes fuera del flujo.",
  ],
};

export const LEDGER_DIFFERENCES: string[] = [
  "La caja general y el Estado de resultados usan el efectivo registrado por el sistema (ventas, cobros, gastos y pagos).",
  "Este módulo usa el efectivo físico que tú capturas, separado por bolsa.",
  "Cuando todo está registrado, el total coincide. Si falta capturar algo, la diferencia es justamente lo pendiente.",
  "Las dos vistas son correctas: una responde cuánto dinero se movió y la otra dónde está.",
];

export const FAQ: HelpFaq[] = [
  {
    q: "¿Por qué la caja chica aparece en $0?",
    a: "Porque al final de la semana depositaste todo el efectivo en el banco. El ingreso de la semana no desaparece: está en “Cobranza del periodo” y en “Caja chica (ingreso)” del corte. El $0 es el efectivo que quedó en la oficina.",
  },
  {
    q: "¿Por qué “Por cobrar” muestra documentos que no están en mi hoja?",
    a: "El ERP tiene todos los documentos. El panel solo muestra los que aún no tienen movimiento en el flujo. Los que ya registraste dejan de aparecer; lo que queda son documentos fuera de tu hoja.",
  },
  {
    q: "¿Por qué no puedo registrar un movimiento con cierta fecha?",
    a: "Esa fecha cae en una semana cerrada. Reabre el último corte o usa otra fecha.",
  },
  {
    q: "¿Cómo corrijo un movimiento que faltó?",
    a: "Si la semana está abierta, regístralo. Si está cerrada, reabre el último corte, regístralo y vuelve a cortar.",
  },
  {
    q: "¿Cómo corrijo un depósito?",
    a: "Elimínalo: se borran las dos partes (caja chica y banco). Luego regístralo de nuevo con el monto correcto.",
  },
  {
    q: "¿Por qué la diferencia con el saldo real no es cero?",
    a: "El saldo real que capturaste no coincide con el calculado. Revisa movimientos faltantes o duplicados, o corrige el saldo real.",
  },
  {
    q: "¿Por qué la deuda con remesas no coincide con mi hoja?",
    a: "El módulo usa el saldo de cuentas por pagar de proveedores. La “deuda con Enrique” de tu hoja es otra deuda y no se administra aquí.",
  },
  {
    q: "¿Puedo borrar un pago de remesa?",
    a: "No desde el flujo si está aplicado en Contabilidad. Cancela el pago en Contabilidad y el flujo se revierte; si la semana está cerrada, reabre el último corte.",
  },
  {
    q: "¿Por qué el total no coincide con el Estado de resultados?",
    a: "Son dos lentes: el Estado de resultados toma el efectivo registrado; el flujo toma el efectivo físico por bolsa. La diferencia es lo que falta capturar o lo que está registrado de otra forma.",
  },
  {
    q: "¿Qué pasa si reabro el último corte?",
    a: "Se borra el corte y la semana se desbloquea para corregir. Solo el último se puede reabrir; los anteriores encadenan su apertura.",
  },
  {
    q: "¿Qué se registra automático y qué a mano?",
    a: "Automático: cobros con cuenta, clientes de depósito directo, gastos y pagos de remesa del módulo. A mano: efectivo de ruta, clientes en efectivo sin cuenta, depósitos, ajustes y corte.",
  },
  {
    q: "¿Qué significa la etiqueta “Auto”?",
    a: "Que el movimiento lo creó el sistema a partir de un documento. Si no la tiene, se capturó a mano.",
  },
  {
    q: "¿Puedo cambiar un cobro de caja chica a banco?",
    a: "Sí, con el botón de cambiar cuenta. Los depósitos no: se eliminan y se re-registran porque mueven las dos bolsas.",
  },
  {
    q: "¿Cuándo conviene cortar?",
    a: "Después de capturar el fin de semana (la venta del domingo suele registrarse el lunes). Si tu configuración tiene días de gracia, el sistema te lo indica al cortar.",
  },
];

export const GLOSSARY: HelpGlossaryItem[] = [
  { term: "Caja chica", definition: "Efectivo de la oficina." },
  { term: "Banco", definition: "Cuenta del titular." },
  {
    term: "Corte",
    definition: "Cierre semanal que guarda saldos y bloquea la semana.",
  },
  {
    term: "Semana cerrada",
    definition: "Semana con corte; no admite movimientos nuevos.",
  },
  { term: "Remesa", definition: "Deuda con proveedor por una remesa (BATCH)." },
  {
    term: "Ruta/despacho",
    definition: "Viaje del chofer que entrega efectivo.",
  },
  {
    term: "Ingreso a cuenta",
    definition: "Depósito de caja chica al banco.",
  },
  {
    term: "Ajuste",
    definition: "Movimiento manual para corregir diferencias.",
  },
  {
    term: "Deuda con remesas",
    definition: "Saldo de cuentas por pagar de proveedores.",
  },
  {
    term: "Auto",
    definition: "Movimiento creado por el sistema desde un documento.",
  },
  {
    term: "Por cobrar",
    definition: "Documentos del ERP que aún no tienen movimiento en el flujo.",
  },
  {
    term: "Saldo real",
    definition: "Lo que realmente hay en el banco/caja, capturado al cortar.",
  },
];
