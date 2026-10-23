import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";

interface Section {
  title: string;
  body: string;
  items?: string[];
}

const SECTIONS: Section[] = [
  {
    title: "Que es este modulo",
    body: "El flujo de efectivo de huevo muestra donde esta el dinero, no cuanto dinero existe en total. Tiene dos bolsas propias:",
    items: [
      "Caja chica: el efectivo que esta en la oficina (lo que entregan los choferes y lo que se usa para gasolina, nomina y compras).",
      "Banco: la cuenta del titular, donde se deposita el dinero y desde donde se pagan las remesas.",
      "La caja general (modulo aparte) sigue siendo el resumen automatico de todo el dinero del negocio; este modulo no la modifica.",
    ],
  },
  {
    title: "Que se registra solo",
    body: "Al guardar estos documentos en el sistema, el movimiento aparece aqui sin que lo captures:",
    items: [
      "Cobros de sucursales y clientes con cuenta por cobrar (van a caja chica, salvo los clientes marcados como deposito directo, que van al banco).",
      "Gastos de Gastos: gasolina, nomina, compras, llantas, recargas. El monto sale del gasto y el concepto incluye al chofer o camion cuando aplica.",
      "Los pagos de remesa hechos desde este modulo.",
    ],
  },
  {
    title: "Que se captura a mano y por que",
    body: "Solo lo que el sistema no puede saber:",
    items: [
      "Ruta (despacho): el efectivo que realmente entrego el chofer. Puede no coincidir con las ventas registradas (credito, merma, cambio); el sistema te muestra la diferencia.",
      "Ingreso a cuenta (deposito): cuanto se deposito realmente al banco.",
      "Ajustes de cuenta y el corte de la semana.",
    ],
  },
  {
    title: "El corte de semana",
    body: "Cierra la semana con el corte: guarda los saldos de caja chica y banco, el saldo real de la cuenta y la deuda con remesas. Una vez cerrada, la semana queda bloqueada para movimientos. Conviene cortar despues de capturar el fin de semana, porque la venta del domingo suele registrarse el lunes.",
    items: [
      "Si te falto capturar algo, reabre el ultimo corte desde Cortes de semana: se borra el corte y la semana se desbloquea para corregir y volver a cortar.",
      "Solo el ultimo corte se puede reabrir; los cortes posteriores encadenan su apertura desde el cierre anterior.",
      "Un deposito no se puede mover de bolsa: se corrige eliminando el movimiento y volviendolo a registrar, porque mueve caja chica y banco al mismo tiempo.",
    ],
  },
  {
    title: "Por que no siempre coincide con el Estado de resultados",
    body: "El Estado de resultados toma el efectivo del periodo desde la caja general (registro automatico de ventas, cobros, gastos y pagos). Este modulo toma el efectivo fisico que tu registras y lo separa por bolsa. Cuando todo esta registrado, el total coincide; si falta capturar algo, la diferencia es justamente lo pendiente de registrar.",
  },
  {
    title: "Clientes que depositan directo al banco",
    body: "En Configurar puedes marcar clientes cuyo pago llega directo a la cuenta. Su cobranza entra a Banco; la de los demas entra a Caja chica. Un ingreso se puede cambiar de bolsa con el boton de cambiar cuenta; los depositos no, porque mueven las dos bolsas a la vez.",
  },
];

export default function EggCashFlowHelpPage() {
  const { slug } = useParams();
  const base = `/business/${slug}/cash-flow`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Ayuda · Flujo de efectivo
          </h1>
          <p className="text-sm text-slate-400">
            Como se registra el efectivo de huevo, que es automatico y que se
            captura a mano.
          </p>
        </div>
        <Link to={base}>
          <Button color="light" size="sm">
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Volver al flujo
          </Button>
        </Link>
      </header>

      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-5"
          >
            <h2 className="text-base font-semibold text-white">
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{section.body}</p>
            {section.items && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
