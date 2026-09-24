import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import { UNIT_CASH_CONFIG } from "@/features/general-cash/config/unitCash.config";
import type { UnitCashUnit } from "@/features/general-cash/types.unit";

interface Props {
  unitType: UnitCashUnit;
}

interface MovementRow {
  movement: string;
  effect: string;
  example: string;
  color: string;
}

const buildUsageSteps = (label: string) => [
  {
    icon: "🏦",
    title: "Crear caja",
    description: `La caja se crea solo al pulsar "Nueva caja". Define el saldo inicial de ${label}: es el efectivo con el que empieza la operacion y cubre todo lo anterior a la fecha de creacion.`,
  },
  {
    icon: "📊",
    title: "Ver historial",
    description:
      "Haz clic en la tarjeta de la caja para ver todos los movimientos: ventas, cobros, gastos, pagos y ajustes.",
  },
  {
    icon: "🔧",
    title: "Ajustar",
    description:
      "Si hay diferencias entre las cuentas y el efectivo real, usa el boton 'Ajuste' en el historial para registrarlas.",
  },
  {
    icon: "🔍",
    title: "Filtrar",
    description:
      "Usa los botones de periodo (7, 15, 30, 90 dias) o el selector de fechas para ver tendencias especificas.",
  },
];

const buildMovementTypes = (label: string): MovementRow[] => [
  {
    movement: "Venta directa (cliente externo)",
    effect: "Suma (+)",
    example: "Venta de contado a cliente sin cuenta por cobrar → +$825",
    color: "text-emerald-400",
  },
  {
    movement: "Cobro de cliente",
    effect: "Suma (+)",
    example: `Cuando un cliente paga su cuenta por cobrar de ${label} al CEDIS → +$1,000`,
    color: "text-emerald-400",
  },
  {
    movement: "Gasto registrado",
    effect: "Resta (-)",
    example: "Nomina semanal → -$1,800",
    color: "text-red-400",
  },
  {
    movement: "Pago del CEDIS a proveedor",
    effect: "Resta (-)",
    example: "Pago a proveedor de alimento → -$5,000",
    color: "text-red-400",
  },
  {
    movement: "Compensación (cliente paga y CEDIS paga proveedor)",
    effect: "Sin efecto neto",
    example:
      "El cliente paga $1,000 al CEDIS y el CEDIS paga $1,000 al proveedor → +$1,000 y -$1,000",
    color: "text-slate-400",
  },
  {
    movement: "Ajuste manual",
    effect: "Suma o resta",
    example: "Diferencia de caja → -$15 o +$10",
    color: "text-blue-400",
  },
  {
    movement: "Corte de caja (entrega a nuevo responsable)",
    effect: "Reinicia el saldo",
    example:
      "El saldo de cierre pasa al responsable anterior y el nuevo periodo inicia con el saldo inicial definido",
    color: "text-amber-400",
  },
  {
    movement: "Venta a cliente interno (cuenta por cobrar)",
    effect: "Sin efecto directo",
    example:
      "Crea una cuenta por cobrar; el efectivo entra al registrar el pago",
    color: "text-slate-400",
  },
];

const buildFaq = (label: string) => [
  {
    q: "¿Qué es un corte de caja?",
    a: "Es la entrega de la caja a un nuevo responsable. Se registra el saldo de cierre, quién entrega y quién recibe, y el saldo inicial y umbral de alerta del nuevo periodo. El historial anterior se conserva y el saldo se reinicia al monto indicado.",
  },
  {
    q: "¿Puedo editar o borrar un corte de caja?",
    a: "No. Los cortes son registros de entrega y no se modifican. Si hubo un error, registra un ajuste manual o realiza un nuevo corte.",
  },
  {
    q: "¿Qué pasa con los movimientos anteriores a la creación de la caja?",
    a: "Se ignoran. La caja solo registra movimientos con fecha igual o posterior a su fecha de creacion; todo lo anterior queda representado por el saldo inicial.",
  },
  {
    q: "¿Qué pasa si todavía no creo la caja?",
    a: "Las ventas, gastos, pagos y compensaciones que ocurran antes de crearla no se registran. Al crearla, define el saldo inicial con el efectivo actual.",
  },
  {
    q: "¿Qué pasa si no registro el saldo inicial?",
    a: "La caja comenzara en $0. Puedes editar el saldo inicial en cualquier momento desde el boton 'Configurar'.",
  },
  {
    q: "¿Cuándo entra el dinero de una venta?",
    a: `Depende del cliente: si el cliente no genera cuenta por cobrar (cliente externo), la venta entra a la caja al registrarse. Si el cliente genera cuenta por cobrar (cliente interno), el dinero entra cuando se registra el pago del cliente.`,
  },
  {
    q: "¿Por qué mi saldo no cambió después de registrar una venta a cliente interno?",
    a: `La venta a cliente interno crea una cuenta por cobrar de ${label}, pero el efectivo no entra hasta que el cliente paga. Solo los cobros aumentan la caja.`,
  },
  {
    q: "¿Puedo borrar un ajuste?",
    a: "Sí. En el historial, haz clic en el icono de basura junto al ajuste. Se te pedira confirmacion antes de eliminarlo.",
  },
  {
    q: "¿Cómo se calcula el saldo?",
    a: "El saldo es el saldo inicial mas todos los movimientos registrados (ventas, cobros, gastos, pagos y ajustes). Puedes recalcularlo en cualquier momento desde 'Configurar'.",
  },
];

export default function UnitGeneralCashHelpPage({ unitType }: Props) {
  const { slug } = useParams();
  const config = UNIT_CASH_CONFIG[unitType];
  const movementTypes = buildMovementTypes(config.label);
  const faq = buildFaq(config.label);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Cómo funciona la Caja General
          </h1>
          <p className="text-sm text-slate-400">
            Guía completa para entender el efectivo de {config.label}, el flujo
            de caja y cómo tomar mejores decisiones.
          </p>
        </div>
        <Link to={`/business/${slug}/general-cash`}>
          <Button color="light">
            <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
            Volver a Caja General
          </Button>
        </Link>
      </header>

      <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          Qué es la Caja General
        </h2>
        <p className="text-sm leading-relaxed text-blue-300">
          La Caja General muestra cuánto dinero tiene {config.label} en tiempo
          real. Cada venta, cobro, gasto, pago, compensación o ajuste actualiza
          el saldo automaticamente desde la fecha en que se crea la caja. Es la
          vision centralizada del efectivo del negocio.
        </p>
      </div>

      <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          Por qué importa
        </h2>
        <p className="text-sm leading-relaxed text-blue-300">
          Saber el efectivo real te permite detectar si el negocio está
          perdiendo dinero antes de que sea tarde, tomar decisiones de compra
          con información real e identificar cuándo hace falta apoyo financiero.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Cómo usarlo</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {buildUsageSteps(config.label).map((step) => (
            <div
              key={step.title}
              className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{step.icon}</span>
                <h3 className="text-lg font-semibold text-white">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Qué afecta el saldo
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Movimiento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Efecto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Ejemplo
                </th>
              </tr>
            </thead>
            <tbody>
              {movementTypes.map((item, i) => (
                <tr
                  key={item.movement}
                  className={
                    i < movementTypes.length - 1
                      ? "border-b border-slate-800/60"
                      : ""
                  }
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {item.movement}
                  </td>
                  <td className={`px-4 py-3 font-medium ${item.color}`}>
                    {item.effect}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-950/40 p-5">
        <h2 className="mb-3 text-lg font-semibold text-emerald-200">
          El gráfico de flujo de efectivo
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-emerald-300">
          <div>
            <h3 className="mb-1 font-semibold text-emerald-200">
              ¿Cómo leerlo?
            </h3>
            <ul className="space-y-1 pl-4">
              <li>
                <span className="font-bold text-emerald-400">
                  Verde (Ingresos):
                </span>{" "}
                Todo el dinero que entro (ventas directas y cobros de clientes)
              </li>
              <li>
                <span className="font-bold text-red-400">Rojo (Gastos):</span>{" "}
                Todo el dinero que salió (gastos operativos y pagos a
                proveedores)
              </li>
              <li>
                <span className="font-bold text-blue-400">Azul (Saldo):</span>{" "}
                La diferencia — si es positivo, ganaste ese día; si es negativo,
                gastaste más de lo que recibiste
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-emerald-200">
              Elige la vista correcta
            </h3>
            <ul className="space-y-1 pl-4">
              <li>
                <strong>Diario:</strong> Para ver qué días específicos son
                problemáticos
              </li>
              <li>
                <strong>Semanal:</strong> Para comparar semanas y detectar
                patrones
              </li>
              <li>
                <strong>Mensual:</strong> Para ver tendencias a largo plazo
              </li>
            </ul>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Preguntas frecuentes
        </h2>
        {faq.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border-l-4 border-amber-500 bg-amber-950/30 p-4"
          >
            <h3 className="mb-1 text-sm font-semibold text-amber-200">
              {item.q}
            </h3>
            <p className="text-sm text-amber-300/80">{item.a}</p>
          </div>
        ))}
      </section>

      <div className="rounded-xl border border-blue-900/40 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          ¿Necesitas más ayuda?
        </h2>
        <p className="text-sm text-blue-300">
          Si tienes dudas sobre cómo usar la Caja General o necesitas ayuda con
          algún movimiento, contacta a tu supervisor o administrador del
          sistema.
        </p>
      </div>
    </div>
  );
}
