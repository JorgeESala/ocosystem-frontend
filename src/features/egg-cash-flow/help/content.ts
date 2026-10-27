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
  "El Flujo de efectivo de huevo responde una sola pregunta: dónde está el dinero. El chofer cobra en la ruta; al terminar, deposita al banco lo cobrado, salvo lo que la oficina retiene para gastos y nómina. El módulo separa dos bolsas: efectivo en oficina (lo que se quedó en la oficina) y banco (la cuenta del titular). La fila CAJA CHICA de tu hoja es la cobranza de las rutas; el cierre de caja chica es el efectivo que quedó en la oficina. No reemplaza la caja general del sistema anterior ni el Estado de resultados: esas vistas muestran el efectivo registrado; este módulo muestra el efectivo físico por bolsa y lo cierra cada semana.";

export const MONEY_FLOW: HelpStep[] = [
  {
    title: "1. El chofer carga el camión",
    description:
      "Carga las cajas de huevo según los pedidos del día y sale a su ruta.",
  },
  {
    title: "2. Cobra en la ruta",
    description:
      "En cada cliente entrega el huevo y cobra en efectivo. El efectivo queda con el chofer. Las sucursales no pagan al recibir: compran a crédito y quedan en “Por cobrar” de Contabilidad.",
  },
  {
    title: "3. Termina la ruta",
    description:
      "El chofer deposita al banco lo que cobró. Si la oficina necesita efectivo para gastos o nómina, deja esa parte en la oficina.",
  },
  {
    title: "4. La oficina usa el efectivo",
    description:
      "Ese efectivo en oficina paga gastos y nómina. Lo que no se usa se deposita al banco.",
  },
  {
    title: "5. Las sucursales pagan después",
    description:
      "La mayoría deposita a la cuenta y entra al banco. Si pagan directo al proveedor, se registra en Contabilidad y no mueve efectivo de la empresa.",
  },
];

export const FIRST_STEPS: HelpStep[] = [
  {
    title: "1. Configura tus saldos iniciales",
    description:
      "Abre Configurar y captura el efectivo inicial en oficina, el saldo inicial del banco, el titular de la cuenta y la fecha desde la que quieres llevar el flujo. Ahí mismo marcas a los clientes que depositan directo al banco.",
  },
  {
    title: "2. Revisa lo que ya entró solo",
    description:
      "Los cobros de sucursales y clientes con cuenta, los gastos de Gastos y los pagos de remesa hechos desde este módulo entran automáticamente. En “Pendiente de ingresar” ves lo que el ERP todavía no tiene registrado en el flujo.",
  },
  {
    title: "3. Registra la cobranza de la ruta",
    description:
      "Cuando el chofer termina, usa “Ingreso” con la fuente Despacho. Captura el total cobrado y, si dejó efectivo en la oficina, cuánto envió a la oficina. El resto se registra como depósito directo al banco.",
  },
  {
    title: "4. Registra el depósito de la oficina",
    description:
      "Cuando la oficina lleve su efectivo al banco, usa “Depósito”. Si el chofer depositó directo, ya quedó en el ingreso del despacho.",
  },
  {
    title: "5. Paga las remesas",
    description:
      "En “Remesas por pagar” elige la deuda y registra el pago desde banco (o efectivo en oficina). El pago queda aplicado en Contabilidad y baja la deuda.",
  },
  {
    title: "6. Cierra la semana",
    description:
      "Elige el rango de la semana, revisa que no falte nada, captura el saldo real del banco y el efectivo real en oficina y usa “Corte de semana”. La semana queda bloqueada; si algo faltó, reabre el último corte, corrige y vuelve a cortar.",
  },
];

export const BAGS: HelpBag[] = [
  {
    id: "cash",
    title: "Efectivo en oficina",
    description:
      "El efectivo que se quedó en la oficina para gastos y nómina. En tu hoja es el cierre de caja chica.",
    enters: [
      "Efectivo de ruta que el chofer entregó a la oficina.",
      "Cobros de clientes en efectivo.",
      "Otros ingresos y ajustes de entrada.",
    ],
    leaves: [
      "Gastos en efectivo.",
      "Pagos de remesa desde la oficina.",
      "Depósitos al banco.",
    ],
  },
  {
    id: "bank",
    title: "Banco",
    description: "La cuenta del titular. En tu hoja es la “Caja general”.",
    enters: [
      "Cobranza de ruta que el chofer deposita directo.",
      "Cobros de sucursales y clientes que pagan al banco.",
      "Depósitos del efectivo de la oficina.",
    ],
    leaves: ["Pagos de remesa desde el banco.", "Ajustes de salida."],
  },
];

export const AUTOMATIC_ITEMS: string[] = [
  "Cobros de sucursales: entran al banco por defecto.",
  "Cobros de clientes marcados como depósito directo: entran al banco.",
  "Cobros de clientes sin marca de depósito directo: entran a efectivo en oficina.",
  "Gastos registrados en Gastos: gasolina, nómina, compras, llantas, recargas.",
  "Pagos de remesa hechos desde este módulo.",
  "Las sucursales que pagan directo al proveedor no entran al flujo; se registran en Contabilidad.",
  "El sistema usa la fecha del documento. Si cae en una semana cerrada no la modifica: reabre el último corte para corregir.",
];

export const MANUAL_ITEMS: string[] = [
  "Cobranza de ruta: el total que cobró el chofer y cuánto se quedó en la oficina.",
  "Clientes en efectivo que no tienen cuenta por cobrar en el ERP.",
  "Depósitos del efectivo de la oficina al banco.",
  "Ajustes de cuenta: diferencias, correcciones o dinero que no viene de un documento.",
  "El corte de semana y los saldos reales.",
];

export const PAGE_SECTIONS: HelpSection[] = [
  {
    id: "cards",
    title: "Tarjetas de arriba",
    paragraphs: [
      "Efectivo en oficina (saldo) es el efectivo que quedó en la oficina. Banco es el saldo calculado de la cuenta. Cobranza del periodo es la cobranza de ruta y clientes (incluye ajustes) y Total es la suma de efectivo en oficina y banco.",
      "La deuda con remesas aparece en la tarjeta Total. Es el saldo de las cuentas por pagar de proveedores, no la deuda con el gerente.",
    ],
  },
  {
    id: "summary",
    title: "Resumen semanal",
    paragraphs: [
      "Efectivo en oficina: apertura + cobranza en efectivo − gastos − pagos de remesa ± ajustes − depósitos = cierre.",
      "Banco: corte anterior + cobranza directa al banco + depósitos − pagos de remesa ± ajustes = corte de la semana. Abajo ves la deuda con remesas, el saldo real y la diferencia.",
    ],
  },
  {
    id: "movements",
    title: "Movimientos",
    paragraphs: [
      "Cada fila trae fecha, bolsa, dirección, categoría, monto, origen y nota. La etiqueta “Auto” indica que lo creó el sistema; si no la tiene, se capturó a mano.",
      "Puedes filtrar por Todas, Efectivo en oficina o Banco.",
    ],
  },
  {
    id: "cuts",
    title: "Cortes de semana",
    paragraphs: [
      "“Caja chica (ingreso)” es la cobranza de la semana (la fila CAJA CHICA de tu hoja, incluye ajustes). “Efectivo en oficina (cierre)” es lo que quedó en la oficina después de depositar. “Banco” es el corte final de la cuenta.",
      "“Saldo real banco” y “Diferencia banco” comparan la cuenta; “Efectivo real” y “Diferencia efectivo” comparan la oficina.",
    ],
  },
  {
    id: "pending",
    title: "Pendiente de ingresar",
    paragraphs: [
      "Muestra el efectivo de ruta que el chofer aún no deposita ni entrega a la oficina, y los cobros registrados en Contabilidad que aún no tienen movimiento en el flujo. Las sucursales que compran a crédito están en Contabilidad → Por cobrar, no aquí.",
      "“Registrar todo al banco” registra los despachos pendientes como depósito directo. Si un despacho dejó efectivo en la oficina, regístralo antes con el monto enviado a la oficina.",
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
      "Escribe el saldo real de la cuenta y el efectivo real en oficina. La diferencia se calcula sola.",
  },
  {
    title: "4. Confirma el corte",
    description:
      "El sistema guarda apertura, cierre, cobranza, gastos, depósitos, remesas, deuda y saldos reales de la semana.",
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
  "Depósito equivocado: elimínalo; se borran las dos partes (efectivo en oficina y banco) y lo vuelves a registrar.",
  "Cobro en la bolsa equivocada: usa el botón de cambiar cuenta en la fila. Los depósitos no se mueven así: se eliminan y se re-registran.",
  "Despacho con la parte de banco u oficina equivocada: elimina el movimiento equivocado y vuelve a registrar el despacho con el monto correcto.",
  "Dinero que no viene de un documento: usa “Ajuste” con la cuenta, dirección, fecha, monto y motivo.",
  "Semana cerrada: reabre el último corte, corrige y vuelve a cortar.",
  "Pago de remesa: no se puede eliminar desde el flujo porque está aplicado en Contabilidad. Cancélalo en Contabilidad y el flujo se revierte.",
];

export const REMESA_NOTES: string[] = [
  "La deuda con remesas del módulo es el saldo de las cuentas por pagar de proveedores (BATCH).",
  "El pago de remesa se registra desde este módulo, se aplica a la deuda y baja el saldo. Desde banco crea una salida de banco; desde efectivo en oficina, una salida de efectivo.",
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
    "Fila CAJA CHICA de tu hoja = columna “Caja chica (ingreso)” del corte y tarjeta “Cobranza del periodo”. Es la cobranza de ruta y clientes, no el saldo de la oficina.",
    "Columna CORTE FINAL / saldo de la cuenta = columna “Banco” del corte.",
    "Columna “Cierre caja chica” = columna “Efectivo en oficina (cierre)”. Es el efectivo que quedó en la oficina después de depositar (puede ser 0).",
    "INGRESO A CUENTA de tu hoja = depósito del efectivo de la oficina al banco y la cobranza que el chofer deposita directo.",
    "La “Caja general” de tu hoja es la cuenta del banco; aquí la llamamos “Banco”. La “Caja general” del sistema anterior es otra vista (el efectivo registrado).",
    "Deuda con Enrique de tu hoja ≠ “Deuda remesas (proveedores)” del módulo.",
    "Si tu hoja no incluye un documento que sí está en el ERP, aparecerá como pendiente en “Pendiente de ingresar” hasta que lo registres o lo dejes fuera del flujo.",
  ],
};

export const LEDGER_DIFFERENCES: string[] = [
  "La caja general del sistema anterior y el Estado de resultados usan el efectivo registrado por el sistema (ventas, cobros, gastos y pagos).",
  "Este módulo usa el efectivo físico que tú capturas, separado por bolsa.",
  "Cuando todo está registrado, el total coincide. Si falta capturar algo, la diferencia es justamente lo pendiente.",
  "Las dos vistas son correctas: una responde cuánto dinero se movió y la otra dónde está.",
];

export const FAQ: HelpFaq[] = [
  {
    q: "¿Por qué el efectivo en oficina aparece en $0?",
    a: "Porque al final de la semana se depositó todo el efectivo en el banco. La cobranza de la semana no desaparece: está en “Cobranza del periodo” y en “Caja chica (ingreso)” del corte. El $0 es el efectivo que quedó en la oficina.",
  },
  {
    q: "¿Por qué “Caja chica (ingreso)” no es el saldo de la oficina?",
    a: "Porque “Caja chica (ingreso)” es la cobranza de la semana (la fila CAJA CHICA de tu hoja). El saldo de la oficina es “Efectivo en oficina (cierre)”, lo que quedó después de depositar y pagar gastos.",
  },
  {
    q: "¿Por qué “Pendiente de ingresar” muestra despachos?",
    a: "Son los despachos cuyo efectivo el chofer todavía no deposita ni entrega a la oficina. Las sucursales que compran a crédito no aparecen aquí: están en Contabilidad → Por cobrar.",
  },
  {
    q: "¿Cómo registro el efectivo que se quedó en la oficina?",
    a: "En el ingreso del despacho captura el “Total cobrado” y, en “Enviado a la oficina”, la parte que se quedó. El resto se registra como depósito directo al banco.",
  },
  {
    q: "¿Cómo registro el depósito del chofer?",
    a: "Ya queda en el ingreso del despacho: la parte que no se envió a la oficina entra al banco. “Depósito” es para cuando la oficina lleva su propio efectivo al banco.",
  },
  {
    q: "¿Por qué una sucursal no aparece en el flujo?",
    a: "Si pagó directo al proveedor, no hubo efectivo para la empresa: se registra en Contabilidad y no entra a este flujo. Si pagó a la cuenta, entra al banco automáticamente.",
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
    a: "Elimínalo: se borran las dos partes (efectivo en oficina y banco). Luego regístralo de nuevo con el monto correcto.",
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
    a: "Automático: cobros de sucursales y clientes con cuenta, clientes de depósito directo, gastos y pagos de remesa del módulo. A mano: cobranza de ruta, clientes en efectivo sin cuenta, depósitos, ajustes y corte.",
  },
  {
    q: "¿Qué significa la etiqueta “Auto”?",
    a: "Que el movimiento lo creó el sistema a partir de un documento. Si no la tiene, se capturó a mano.",
  },
  {
    q: "¿Puedo cambiar un cobro de efectivo en oficina a banco?",
    a: "Sí, con el botón de cambiar cuenta. Los depósitos no: se eliminan y se re-registran porque mueven las dos bolsas.",
  },
  {
    q: "¿Cuándo conviene cortar?",
    a: "Después de capturar el fin de semana (la venta del domingo suele registrarse el lunes). Si tu configuración tiene días de gracia, el sistema te lo indica al cortar.",
  },
];

export const GLOSSARY: HelpGlossaryItem[] = [
  {
    term: "Efectivo en oficina",
    definition: "El efectivo que se quedó en la oficina para gastos y nómina.",
  },
  {
    term: "Caja chica (tu hoja)",
    definition: "La cobranza de las rutas; la fila CAJA CHICA de tu hoja.",
  },
  {
    term: "Banco",
    definition: "La cuenta del titular; en tu hoja es la “Caja general”.",
  },
  {
    term: "Efectivo en ruta",
    definition:
      "Lo que el chofer cobró y aún no deposita ni entrega a la oficina.",
  },
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
    definition: "Viaje del chofer que entrega huevo y cobra.",
  },
  {
    term: "Ingreso a cuenta",
    definition: "Depósito del efectivo de la oficina al banco.",
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
    term: "Pendiente de ingresar",
    definition: "Efectivo en ruta y cobros que aún no están en el flujo.",
  },
  {
    term: "Saldo real",
    definition:
      "Lo que realmente hay en el banco o en la oficina, capturado al cortar.",
  },
];
