import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";

const GENERAL_HELP = {
  title: "Qué es la Caja General",
  content:
    "La Caja General muestra cuánto dinero tiene cada sucursal en tiempo real. Cada venta, gasto, pago o ajuste actualiza el saldo automáticamente. Es tu visión centralizada del efectivo en toda la operación.",
};

const IMPORTANCE_HELP = {
  title: "Por qué importa",
  content:
    "Saber el efectivo real te permite detectar si una sucursal está perdiendo dinero antes de que sea tarde, tomar decisiones de compra con información real, e identificar sucursales que necesitan apoyo financiero.",
};

const USAGE_STEPS = [
  {
    icon: "🏦",
    title: "Crear caja",
    description:
      "Define el saldo inicial de cada sucursal. Este es el dinero con el que empieza el día.",
  },
  {
    icon: "📊",
    title: "Ver historial",
    description:
      "Haz clic en una tarjeta de sucursal para ver todos los movimientos: ventas, gastos, pagos y ajustes.",
  },
  {
    icon: "🔧",
    title: "Ajustar",
    description:
      "Si hay diferencias entre las cuentas recibidas y el dinero del reporte, usa el botón 'Ajuste' en el historial para registrarlas.",
  },
  {
    icon: "🔍",
    title: "Filtrar",
    description:
      "Usa los botones de periodo (7, 15, 30, 90 días) o el selector de fechas para ver tendencias específicas.",
  },
];

const MOVEMENT_TYPES = [
  {
    movement: "Venta de remesa",
    effect: "Suma (+)",
    example: "Venta de 15 kg a cliente → +$825",
    color: "text-emerald-400",
  },
  {
    movement: "Subir reporte",
    effect: "Suma (+)",
    example:
      "Subir reporte de Roneli (excluye pollo, merma, matados) → +$2,340",
    color: "text-emerald-400",
  },
  {
    movement: "Gasto registrado",
    effect: "Resta (-)",
    example: "Nómina semanal → -$1,800",
    color: "text-red-400",
  },
  {
    movement: "Pago a proveedor",
    effect: "Resta (-)",
    example: "Pago a Pollo Vivo → -$5,000",
    color: "text-red-400",
  },
  {
    movement: "Ajuste manual",
    effect: "Suma o resta",
    example: "Diferencia de peso → -$15 o +$10",
    color: "text-blue-400",
  },
  {
    movement: "Compra de remesa",
    effect: "Sin efecto directo",
    example: "Crea cuenta por pagar; el efectivo se reduce al pagar",
    color: "text-slate-400",
  },
];

const FAQ = [
  {
    q: "¿Qué pasa si no registro el saldo inicial?",
    a: "La caja comenzará en $0. Puedes editar el saldo inicial en cualquier momento desde la configuración (ícono de engranaje en la tarjeta).",
  },
  {
    q: "¿Por qué mi saldo no cambió después de comprar una remesa?",
    a: "Las remesas crean una cuenta por pagar (deuda), pero el efectivo no se reduce hasta que se registre el pago. Solo los pagos disminuyen la caja.",
  },
  {
    q: "¿Puedo borrar un ajuste?",
    a: "Sí. En el historial, haz clic en el ícono de basura junto al ajuste. Se te pedirá confirmación antes de eliminarlo.",
  },
  {
    q: "¿Qué significa 'Sin datos en el rango seleccionado'?",
    a: "No hay movimientos registrados en ese periodo. Prueba con un rango de fechas más amplio o verifica que se hayan registrado ventas, gastos o pagos.",
  },
  {
    q: "¿Subir reportes duplica los datos del pollo?",
    a: "No. El sistema excluye automáticamente las categorías de Pollo, Merma y Matados del reporte, ya que esas ventas ya se registran en la sección de Remesas y Ventas.",
  },
];

export default function GeneralCashHelpPage() {
  const { slug } = useParams();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Cómo funciona la Caja General
          </h1>
          <p className="text-sm text-slate-400">
            Guía completa para entender el efectivo de tus sucursales, el flujo
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

      {/* QUE ES */}
      <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          {GENERAL_HELP.title}
        </h2>
        <p className="text-sm leading-relaxed text-blue-300">
          {GENERAL_HELP.content}
        </p>
      </div>

      {/* POR QUE IMPORTA */}
      <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          {IMPORTANCE_HELP.title}
        </h2>
        <p className="text-sm leading-relaxed text-blue-300">
          {IMPORTANCE_HELP.content}
        </p>
      </div>

      {/* COMO USARLO */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Cómo usarlo</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {USAGE_STEPS.map((step) => (
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

      {/* QUE AFECTA EL SALDO */}
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

      {/* EL GRAFICO - Highlighted section */}
      <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-950/40 p-5">
        <h2 className="mb-3 text-lg font-semibold text-emerald-200">
          El gráfico de flujo de efectivo
        </h2>

        <div className="space-y-4 text-sm leading-relaxed text-emerald-300">
          <div>
            <h3 className="mb-1 font-semibold text-emerald-200">
              ¿Por qué existe este gráfico?
            </h3>
            <p>
              El gráfico muestra el movimiento de efectivo combinado de todas
              las sucursales. Aunque al principio parezca que solo muestra un
              punto, su valor crece con el tiempo:
            </p>
            <ul className="mt-2 space-y-1 pl-4">
              <li>
                <strong>Con 1 día de datos:</strong> Ves si ese día ganaste o
                perdiste dinero
              </li>
              <li>
                <strong>Con 1 semana:</strong> Identificas qué días son más
                rentables
              </li>
              <li>
                <strong>Con 1 mes:</strong> Ves tendencias claras — qué semanas
                fueron buenas y cuáles no
              </li>
              <li>
                <strong>Con 3+ meses:</strong> Puedes predecir patrones
                estacionales y planificar compras
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-emerald-200">
              ¿Cómo leerlo?
            </h3>
            <ul className="space-y-1 pl-4">
              <li>
                <span className="font-bold text-emerald-400">
                  Verde (Ingresos):
                </span>{" "}
                Todo el dinero que entró (tickets en los reportes + ventas de
                remesa)
              </li>
              <li>
                <span className="font-bold text-red-400">Rojo (Gastos):</span>{" "}
                Todo el dinero que salió (gastos operativos + pagos a
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
              ¿Por qué no es opcional?
            </h3>
            <p>
              Sin este gráfico, solo verías el saldo actual. El gráfico te
              muestra la <em>dirección</em> — si el dinero está subiendo o
              bajando. Un saldo positivo hoy puede estar cayendo desde hace
              semanas, y eso solo se ve en el gráfico.
            </p>
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
                <strong>Mensual:</strong> Para ver tendencias a largo plazo y
                planificación
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
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

      {/* FOOTER */}
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
