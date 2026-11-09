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
  "El Flujo de efectivo de huevo responde una sola pregunta: dónde está el dinero. El chofer cobra en la ruta; al terminar, casi todo se deposita en la cuenta del titular. El viernes, un solo despacho conserva efectivo para pagar la nómina registrada y dejar el efectivo objetivo de la oficina (por defecto $1,000); el resto se deposita. Si ya había sobrante de la semana anterior, solo se retiene la diferencia y el exceso también se deposita. El módulo separa dos bolsas: efectivo en oficina (lo que se quedó en la oficina) y la cuenta del titular. La fila CAJA CHICA de tu hoja es la cobranza de las rutas; el cierre de caja chica es el efectivo que quedó en la oficina. No reemplaza la caja general del sistema anterior ni el Estado de resultados: esas vistas muestran el efectivo registrado; este módulo muestra el efectivo físico por bolsa y lo cierra cada semana.";

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
      "Casi todo el efectivo de la ruta se deposita en la cuenta del titular. El viernes, uno de los despachos conserva la parte necesaria para la nómina y el efectivo objetivo de la oficina.",
  },
  {
    title: "4. La oficina usa el efectivo",
    description:
      "Ese efectivo en oficina paga la nómina registrada y los gastos de la semana. Si sobra más de lo objetivo, se deposita a la cuenta del titular.",
  },
  {
    title: "5. Las sucursales pagan después",
    description:
      "La mayoría deposita a la cuenta del titular y entra a la cuenta. Si pagan directo al proveedor, se registra en Contabilidad y no mueve efectivo de la empresa.",
  },
];

export const FIRST_STEPS: HelpStep[] = [
  {
    title: "1. Configura tus saldos iniciales",
    description:
      "Abre Configurar y captura el efectivo inicial en oficina, el saldo inicial de la cuenta del titular, el nombre de la cuenta y la fecha desde la que quieres llevar el flujo. Ahí mismo marcas a los clientes con cuenta que normalmente depositan en la cuenta del titular.",
  },
  {
    title: "2. Revisa lo que ya entró solo",
    description:
      "Los cobros de sucursales y clientes con cuenta, los gastos de Gastos y los pagos de remesa hechos desde este módulo entran automáticamente. En “Cobranza de ruta” ves los despachos por confirmar y en “Cobros por registrar” lo que el ERP todavía no tiene registrado en el flujo.",
  },
  {
    title: "3. Cierra el efectivo del viernes",
    description:
      "En “Cierre de efectivo del viernes” elige el despacho que conservará efectivo. Revisa la nómina registrada, el efectivo objetivo y el depósito; después confirma el cierre. Los demás despachos del periodo se depositan completos.",
  },
  {
    title: "4. Registra depósitos y gastos",
    description:
      "El cierre deposita el sobrante automáticamente. Usa “Depósito” solo para efectivo adicional que lleves a la cuenta y “Gasto en efectivo” para gastos que salgan de la oficina.",
  },
  {
    title: "5. Paga las remesas",
    description:
      "En “Remesas por pagar” elige la deuda y registra el pago desde la cuenta del titular (o efectivo en oficina). El pago queda aplicado en Contabilidad y baja la deuda.",
  },
  {
    title: "6. Cierra la semana",
    description:
      "Elige el rango de la semana, revisa que no falte nada, captura el saldo real de la cuenta del titular y el efectivo real en oficina y usa “Cerrar semana”. La semana queda bloqueada; si algo faltó, reabre el último corte, corrige y vuelve a cortar.",
  },
];

export const BAGS: HelpBag[] = [
  {
    id: "cash",
    title: "Efectivo en oficina",
    description:
      "El efectivo que se quedó en la oficina para gastos y nómina. El viernes debe quedar en el efectivo objetivo configurado. En tu hoja es el cierre de caja chica.",
    enters: [
      "Efectivo de ruta que el chofer entregó a la oficina.",
      "Cobros de clientes en efectivo.",
      "Otros ingresos y ajustes de entrada.",
    ],
    leaves: [
      "Gastos en efectivo.",
      "Pagos de remesa desde la oficina.",
      "Depósitos a la cuenta del titular.",
    ],
  },
  {
    id: "bank",
    title: "Cuenta del titular",
    description: "La cuenta del titular. En tu hoja es la “Caja general”.",
    enters: [
      "Cobranza de ruta que el chofer deposita directo a la cuenta del titular.",
      "Cobros de sucursales y clientes que pagan a la cuenta del titular.",
      "Depósitos del efectivo de la oficina.",
    ],
    leaves: [
      "Pagos de remesa desde la cuenta del titular.",
      "Ajustes de salida.",
    ],
  },
];

export const AUTOMATIC_ITEMS: string[] = [
  "Cobros de sucursales: entran a la cuenta del titular por defecto.",
  "Cobros de clientes con cuenta marcados como depósito directo: entran a la cuenta del titular.",
  "Cobros de clientes con cuenta: si la forma de pago es efectivo, entran a efectivo en oficina; si es transferencia, depósito, cheque o SPEI, entran a la cuenta del titular.",
  "La marca de depósito directo solo cambia el destino por defecto cuando la forma de pago es “Otro”.",
  "Gastos registrados en Gastos: gasolina, nómina, compras, llantas, recargas.",
  "Pagos de remesa hechos desde este módulo.",
  "Las sucursales que pagan directo al proveedor no entran al flujo; se registran en Contabilidad.",
  "El sistema usa la fecha del documento. Si cae en una semana cerrada no la modifica: reabre el último corte para corregir.",
];

export const MANUAL_ITEMS: string[] = [
  "Confirmar la cobranza de ruta y ajustar cuánto se quedó en la oficina.",
  "Depósitos del efectivo de la oficina a la cuenta del titular.",
  "Ajustes de cuenta: diferencias, correcciones o dinero que no viene de un documento.",
  "El corte de semana y los saldos reales.",
];

export const PAGE_SECTIONS: HelpSection[] = [
  {
    id: "cards",
    title: "Tarjetas de arriba",
    paragraphs: [
      "Efectivo en oficina es el efectivo que quedó en la oficina. La cuenta del titular es el saldo calculado. Cobranza del periodo es la cobranza de ruta y clientes (incluye ajustes) y Efectivo + cuenta es la suma de efectivo en oficina y la cuenta del titular.",
      "La deuda con remesas aparece en la tarjeta Efectivo + cuenta. Es el saldo de las cuentas por pagar de proveedores, no la deuda con el gerente.",
    ],
  },
  {
    id: "summary",
    title: "Resumen semanal",
    paragraphs: [
      "Efectivo en oficina: apertura + cobranza en efectivo − gastos − pagos de remesa ± ajustes − depósitos = cierre.",
      "Cuenta del titular: corte anterior + cobranza directa a la cuenta + depósitos − pagos de remesa ± ajustes = corte de la semana. Abajo ves la deuda con remesas, el saldo real y la diferencia.",
    ],
  },
  {
    id: "movements",
    title: "Movimientos",
    paragraphs: [
      "Cada fila trae fecha, bolsa, dirección, categoría, monto, origen y nota. La etiqueta “Auto” indica que lo creó el sistema; si no la tiene, se capturó a mano.",
      "Puedes filtrar por Todas, Efectivo en oficina o Cuenta del titular.",
    ],
  },
  {
    id: "cuts",
    title: "Cortes de semana",
    paragraphs: [
      "“Caja chica (ingreso)” es la cobranza de la semana (la fila CAJA CHICA de tu hoja, incluye ajustes). “Efectivo en oficina (cierre)” es lo que quedó en la oficina después de depositar. “Cuenta del titular” es el corte final de la cuenta.",
      "“Saldo real cuenta” y “Diferencia cuenta” comparan la cuenta del titular; “Efectivo real” y “Diferencia efectivo” comparan la oficina.",
    ],
  },
  {
    id: "pending",
    title: "Cierre de viernes, cobranza de ruta y cobros por registrar",
    paragraphs: [
      "La cobranza de ruta se calcula sola con las ventas en efectivo del despacho. Ahí ves el total cobrado, cuánto se depositó en la cuenta del titular y cuánto se quedó en oficina. Los clientes en efectivo ya vienen incluidos; no se capturan a mano.",
      "El “Cierre de efectivo del viernes” elige un despacho para conservar efectivo. Calcula lo que falta para llegar al efectivo objetivo, descuenta la nómina ya registrada y deposita el sobrante anterior. Los demás despachos pendientes se confirman completos a la cuenta.",
      "Confirma cada despacho con un clic cuando necesites una corrección manual. Si se quedó efectivo en la oficina, ajusta el monto antes de confirmar. “Confirmar todos” registra de una vez los despachos pendientes.",
      "Abajo aparecen los cobros a crédito registrados en Contabilidad que aún no tienen movimiento en el flujo. Si el cobro se registra como efectivo, entra a efectivo en oficina; si es transferencia, depósito, cheque o SPEI, entra a la cuenta del titular. Usa “Solo crédito” para ocultar la cobranza en efectivo y ver únicamente esos cobros.",
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
  "Depósito equivocado: elimínalo; se borran las dos partes (efectivo en oficina y cuenta del titular) y lo vuelves a registrar.",
  "Cobro en la bolsa equivocada: usa el botón de cambiar cuenta en la fila. Los depósitos no se mueven así: se eliminan y se re-registran.",
  "Despacho con la parte de la cuenta u oficina equivocada: elimina el movimiento equivocado y vuelve a registrar el despacho con el monto correcto.",
  "Dinero que no viene de un documento: usa “Ajuste” con la cuenta, dirección, fecha, monto y motivo.",
  "Semana cerrada: reabre el último corte, corrige y vuelve a cortar.",
  "Pago de remesa: no se puede eliminar desde el flujo porque está aplicado en Contabilidad. Cancélalo en Contabilidad y el flujo se revierte.",
];

export const REMESA_NOTES: string[] = [
  "La deuda con remesas del módulo es el saldo de las cuentas por pagar de proveedores (BATCH).",
  "El pago de remesa se registra desde este módulo, se aplica a la deuda y baja el saldo. Desde la cuenta del titular crea una salida de la cuenta; desde efectivo en oficina, una salida de efectivo.",
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
    "Columna CORTE FINAL / saldo de la cuenta = columna “Cuenta del titular” del corte.",
    "Columna “Cierre caja chica” = columna “Efectivo en oficina (cierre)”. Es el efectivo que quedó en la oficina después de depositar (puede ser 0).",
    "INGRESO A CUENTA de tu hoja = depósito del efectivo de la oficina a la cuenta del titular, la cobranza que el chofer deposita directo y el sobrante que deposita el cierre de viernes.",
    "La “Caja general” de tu hoja es la cuenta del titular; aquí la llamamos “Cuenta del titular”. La “Caja general” del sistema anterior es otra vista (el efectivo registrado).",
    "Deuda con Enrique de tu hoja ≠ “Deuda remesas (proveedores)” del módulo.",
    "Si tu hoja no incluye un documento que sí está en el ERP, aparecerá como pendiente en “Cobros por registrar” hasta que lo registres o lo dejes fuera del flujo.",
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
    a: "Porque no quedó efectivo en la oficina o el cierre de viernes depositó el sobrante. La cobranza de la semana no desaparece: está en “Cobranza del periodo” y en “Caja chica (ingreso)” del corte. El $0 es el efectivo que quedó en la oficina.",
  },
  {
    q: "¿Cómo funciona el cierre de efectivo del viernes?",
    a: "Eliges el despacho que conservará efectivo. El sistema revisa la nómina ya registrada en Gastos, calcula cuánto falta para llegar al efectivo objetivo de la oficina y deposita el resto de los despachos. Si ya había sobrante de la semana anterior, solo retiene la diferencia y deposita el exceso.",
  },
  {
    q: "¿De dónde sale la nómina del cierre de viernes?",
    a: "De los gastos con categoría Nómina que ya registraste en Gastos para esa semana. No se captura dos veces en el flujo. Si no hay nómina registrada, el sistema avisa pero te deja continuar.",
  },
  {
    q: "¿Qué pasa si el despacho del viernes no alcanza?",
    a: "Se retiene todo el efectivo de ese despacho y el sistema muestra cuánto falta para el objetivo. Puedes elegir otro despacho y volver a calcular o ajustar el efectivo objetivo en Configurar.",
  },
  {
    q: "¿Por qué “Caja chica (ingreso)” no es el saldo de la oficina?",
    a: "Porque “Caja chica (ingreso)” es la cobranza de la semana (la fila CAJA CHICA de tu hoja). El saldo de la oficina es “Efectivo en oficina (cierre)”, lo que quedó después de depositar y pagar gastos.",
  },
  {
    q: "¿Por qué “Cobranza de ruta” muestra despachos?",
    a: "Son los despachos con ventas en efectivo que aún no se confirman en el flujo. Las sucursales que compran a crédito no aparecen aquí: están en Contabilidad → Por cobrar.",
  },
  {
    q: "¿Cómo registro el efectivo que se quedó en la oficina?",
    a: "Usa “Cierre de efectivo del viernes” y elige el despacho que conservará efectivo. El sistema calcula cuánto retener para la nómina y el efectivo objetivo. Para correcciones puntuales también puedes ajustar “Se quedó en oficina” en un despacho.",
  },
  {
    q: "¿Cómo registro el depósito del chofer?",
    a: "La parte que no se quedó en oficina entra a la cuenta del titular al confirmar la cobranza de ruta. El cierre de viernes deposita el sobrante de la oficina; “Depósito” es para efectivo adicional que lleves a la cuenta.",
  },
  {
    q: "¿A dónde entra un cobro en efectivo?",
    a: "Entra a efectivo en oficina. Si el cobro es transferencia, depósito, cheque o SPEI, entra a la cuenta del titular.",
  },
  {
    q: "¿Por qué una sucursal no aparece en el flujo?",
    a: "Si pagó directo al proveedor, no hubo efectivo para la empresa: se registra en Contabilidad y no entra a este flujo. Si pagó a la cuenta, entra a la cuenta del titular automáticamente.",
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
    a: "Elimínalo: se borran las dos partes (efectivo en oficina y cuenta del titular). Luego regístralo de nuevo con el monto correcto.",
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
    a: "Automático: cobros de sucursales y clientes con cuenta, clientes de depósito directo, gastos y pagos de remesa del módulo. La cobranza de ruta se calcula sola con las ventas del despacho. El cierre de viernes calcula la retención y el depósito. A mano: ajustes, depósitos adicionales y corte.",
  },
  {
    q: "¿Todavía tengo que capturar a los clientes en efectivo?",
    a: "No. Sus ventas ya vienen en la cobranza de ruta del despacho. Confirma el total y, si dejaron efectivo en oficina, ajusta ese monto antes de confirmar.",
  },
  {
    q: "¿Qué significa la etiqueta “Auto”?",
    a: "Que el movimiento lo creó el sistema a partir de un documento. Si no la tiene, se capturó a mano.",
  },
  {
    q: "¿Puedo cambiar un cobro de efectivo en oficina a la cuenta del titular?",
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
    term: "Cuenta del titular",
    definition: "La cuenta del titular; en tu hoja es la “Caja general”.",
  },
  {
    term: "Cierre de viernes",
    definition:
      "Cálculo que elige un despacho para conservar efectivo, descuenta la nómina registrada y deposita el sobrante para dejar el efectivo objetivo en oficina.",
  },
  {
    term: "Efectivo objetivo",
    definition:
      "El efectivo que debe quedar en la oficina después del cierre de viernes. Se configura en Configurar y por defecto es $1,000.",
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
    definition: "Depósito del efectivo de la oficina a la cuenta del titular.",
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
    term: "Cobranza de ruta",
    definition:
      "Ventas en efectivo del despacho que se confirman para separar cuenta del titular y oficina.",
  },
  {
    term: "Saldo real",
    definition:
      "Lo que realmente hay en la cuenta del titular o en la oficina, capturado al cortar.",
  },
];
