import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";

const INTRO = {
  title: "Qué es la Contabilidad de Huevo",
  content:
    "La Contabilidad de Huevo muestra lo que los clientes internos le deben a cada CEDIS de huevo (Por cobrar), lo que cada CEDIS debe a sus proveedores (Por pagar) y el resumen financiero con deuda, por cobrar, inventario y balance neto.",
};

const MODES = [
  {
    icon: "📥",
    title: "Por cobrar",
    description:
      "Deudas de los clientes internos con los CEDIS de huevo. Es la vista de cobranza: quién debe, cuánto y desde hace cuántos días.",
  },
  {
    icon: "📤",
    title: "Por pagar",
    description:
      "Deudas de los CEDIS de huevo con sus proveedores. Es la vista de pagos pendientes hacia afuera.",
  },
  {
    icon: "📊",
    title: "Resumen financiero",
    description:
      "Foto por CEDIS: deuda total, por cobrar, valor en inventario y balance neto, con desglose por cliente y por remesa. Se puede exportar a PDF.",
  },
];

const OPENING_BALANCE_STEPS = [
  {
    title: "1. Se parte del saldo actual",
    description:
      "El sistema toma lo que el cliente debe hoy, sumando todas sus cuentas abiertas en todos los CEDIS de huevo.",
  },
  {
    title: "2. Se resta lo ocurrido en el mes",
    description:
      "A ese saldo se le restan los cargos del mes y se le suman los pagos del mes. Lo que queda es lo que debía al empezar el mes.",
  },
  {
    title: "3. Las deudas creadas en el mes cuentan como cargos",
    description:
      "Si una deuda nació en junio, junio empieza en cero para esa deuda: su total original entra como cargo del mes.",
  },
];

const MOVEMENT_TYPES = [
  {
    movement: "Cargo",
    effect: "Aumenta la deuda (+)",
    example: "Se crea una cuenta por cobrar de $5,000 → +$5,000",
    color: "text-red-400",
  },
  {
    movement: "Pago",
    effect: "Reduce la deuda (−)",
    example: "El cliente paga $400 de una deuda de $1,100 → -$400",
    color: "text-emerald-400",
  },
  {
    movement: "Ajuste",
    effect: "Aumenta o reduce",
    example: "El documento origen sube de $1,100 a $2,000 → +$900",
    color: "text-blue-400",
  },
  {
    movement: "Compensación",
    effect: "Reduce la deuda (−)",
    example: "Se netea deuda entre sucursal, CEDIS y proveedor",
    color: "text-emerald-400",
  },
  {
    movement: "Reversa",
    effect: "Devuelve un pago (+)",
    example: "Se cancela un pago de $400 → +$400 de vuelta",
    color: "text-blue-400",
  },
];

const FAQ = [
  {
    q: "¿Cómo se calcula el saldo inicial del mes?",
    a: "Saldo actual menos los movimientos del mes menos las deudas creadas en el mes. No se necesita ninguna fecha fija: con el saldo de hoy y el historial, el pasado se deduce solo. Siempre cumple: inicial + cargos − pagos = final.",
  },
  {
    q: "¿Por qué un mes viejo muestra cargos en cero?",
    a: "Antes, los aumentos de deuda por actualización de documentos no dejaban rastro en el historial. Desde que existen los movimientos de ajuste, todo aumento queda registrado. Los meses anteriores a ese cambio pueden mostrar cargos incompletos.",
  },
  {
    q: "¿Por qué un cliente no aparece en Por cobrar?",
    a: "La tabla solo muestra cuentas con saldo mayor a cero en los últimos 30 días por defecto. Si el cliente ya liquidó todo, desaparece de la tabla, pero su historial completo sigue disponible en su reporte mensual.",
  },
  {
    q: "¿Qué significa que una cuenta no tenga movimientos?",
    a: "Es una deuda recién creada sobre la que aún no se registra ningún pago ni ajuste. Su total y su saldo son iguales.",
  },
  {
    q: "¿Los pagos y los cargos son lo único que mueve el saldo?",
    a: "Sí. Todo cambio de saldo deja un movimiento: pagos y compensaciones lo bajan; cargos y ajustes lo suben; las reversas devuelven pagos cancelados.",
  },
  {
    q: "¿Cómo se reparte un anticipo?",
    a: "Al registrar un anticipo, el sistema muestra primero cómo se aplicaría a las deudas abiertas, de la más antigua a la más reciente. Puedes elegir 'Aplicar a estas deudas' o 'Solo registrar como saldo a favor'. Nada se guarda hasta que eliges una opción.",
  },
  {
    q: "¿Qué significa la etiqueta Saldo a favor?",
    a: "Es dinero pagado que aún no se aplica a ninguna deuda. Nunca se aplica solo: lo ves como chip en las cuentas abiertas, como sección en el estado de cuenta del cliente y con una etiqueta en los movimientos que lo aplican.",
  },
  {
    q: "¿Qué pasa si cancelo un pago?",
    a: "Se reactivan las deudas donde estaba aplicado y el dinero vuelve a quedar disponible como saldo a favor. El folio se conserva en la nota del movimiento. Antes de cancelar, el sistema dice cuántas deudas se reactivarán y por cuánto dinero.",
  },
];

export const EggAccountingHelpPage = () => {
  const { slug } = useParams();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Cómo funciona la Contabilidad de Huevo
          </h1>
          <p className="text-sm text-slate-400">
            Guía para entender las cuentas por cobrar y por pagar, el reporte
            mensual por cliente y cómo se calcula cada número.
          </p>
        </div>
        <Link to={`/business/${slug}/accounting`}>
          <Button color="light">
            <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
            Volver a Contabilidad
          </Button>
        </Link>
      </header>

      <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          {INTRO.title}
        </h2>
        <p className="text-sm leading-relaxed text-blue-300">{INTRO.content}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Las tres vistas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {MODES.map((mode) => (
            <div
              key={mode.title}
              className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mode.icon}</span>
                <h3 className="text-lg font-semibold text-white">
                  {mode.title}
                </h3>
              </div>
              <p className="text-sm text-slate-300">{mode.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-950/40 p-5">
        <h2 className="mb-3 text-lg font-semibold text-emerald-200">
          Cómo se calcula el saldo inicial del mes
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-emerald-300">
          <p>
            El reporte mensual responde tres preguntas: ¿cuánto debía el cliente
            al empezar el mes?, ¿qué se movió en el mes?, ¿cuánto debe al
            terminar? El saldo inicial se deduce del presente, sin fechas fijas:
          </p>
          {OPENING_BALANCE_STEPS.map((step) => (
            <div key={step.title}>
              <h3 className="mb-1 font-semibold text-emerald-200">
                {step.title}
              </h3>
              <p>{step.description}</p>
            </div>
          ))}
          <p>
            Las deudas liquidadas dentro del mes también cuentan: aparecen con
            saldo final en cero y sus pagos quedan en el historial.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Qué mueve el saldo</h2>
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
              {MOVEMENT_TYPES.map((item, i) => (
                <tr
                  key={item.movement}
                  className={
                    i < MOVEMENT_TYPES.length - 1
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Preguntas frecuentes
        </h2>
        {FAQ.map((item, i) => (
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
    </div>
  );
};
