import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";

const SECTIONS = [
  {
    title: "Resumen",
    paragraphs: [
      "El Resumen muestra los números grandes del periodo: ventas, utilidad, margen, ticket promedio y concentración de clientes, comparados contra el periodo anterior de la misma duración.",
      "Las tarjetas de 'Necesitan atención' te dicen dónde mirar primero: clientes sin ruta, sin localidad, dormidos, que nunca han comprado, y rutas sin actividad o sin localidades. Haz clic en cualquiera para ir al detalle.",
      "El calendario semanal muestra qué rutas operan cada día y cuántos clientes activos cubren.",
    ],
  },
  {
    title: "Clientes",
    paragraphs: [
      "El catálogo de clientes es la base de la distribución: nombre, negocio, localidad y tipo.",
      "Los clientes internos (sucursales o clientes con cuenta) generan cuentas por cobrar automáticamente al venderles.",
      "Al eliminar un cliente no se borra: se marca como inactivo y puedes recuperarlo con 'Mostrar inactivos' y el botón Reactivar.",
    ],
  },
  {
    title: "Rutas por localidad",
    paragraphs: [
      "Cada ruta cubre una o varias localidades. Los clientes no se asignan uno por uno: se asignan por la localidad que tienen registrada.",
      "Si la localidad de un cliente está en una ruta, el cliente aparece en esa ruta. Si está en varias, aparece en todas.",
      "Si un cliente no tiene localidad, o ninguna ruta cubre su localidad, aparece como 'Sin ruta'. Esa vista te ayuda a detectar huecos de cobertura.",
    ],
  },
  {
    title: "Días de entrega",
    paragraphs: [
      "Marca los días (Lun a Dom) en que opera cada ruta. Sirve como referencia para planear entregas y compras.",
      "Por ahora los días no generan tareas ni entregas automáticas, pero mantienen el calendario visible para todo el equipo.",
    ],
  },
  {
    title: "Rendimiento y rentabilidad",
    paragraphs: [
      "Utilidad = Ventas − Costo de remesa − Combustible.",
      "El costo es el total de la remesa repartido entre las piezas o kilos vendidos de esa remesa; no es un costo capturado venta por venta.",
      "El combustible suma los gastos de combustible registrados con esa ruta.",
      "Ejemplo: Ruta Centro vendió $1,500, con $150 de costo de remesa y $250 de combustible: utilidad $1,100 y margen 73.33%.",
      "Si una remesa no tiene peso o cantidad registrada, su costo aparece en $0 y el margen se ve más alto de lo real. La nómina de choferes todavía no se incluye.",
    ],
  },
  {
    title: "Historial de compras",
    paragraphs: [
      "Muestra el resumen de compras de un cliente en el rango de fechas: ventas totales, cantidad, número de compras y última compra.",
      "Para huevo la cantidad se muestra en cajas, casilleros y piezas; para pollo vivo en aves.",
      "Solo incluye ventas registradas con ese cliente.",
    ],
  },
];

const FAQ = [
  {
    q: "¿Por qué un cliente no aparece en ninguna ruta?",
    a: "Porque no tiene localidad registrada o ninguna ruta cubre su localidad. Edita el cliente para agregar su localidad, o agrega esa localidad a una ruta.",
  },
  {
    q: "¿Por qué una ruta no muestra clientes?",
    a: "Porque sus localidades aún no tienen clientes asignados, o porque los clientes de esas localidades están marcados como inactivos.",
  },
  {
    q: "¿Puedo tener una localidad en dos rutas?",
    a: "Sí. Los clientes de esa localidad aparecerán en ambas rutas y sus ventas se contarán en las dos.",
  },
  {
    q: "¿Por qué el costo de una ruta aparece en $0?",
    a: "Porque alguna remesa vendida en el rango no tiene peso o cantidad registrada. Al corregir la remesa, el costo se recalcula solo.",
  },
  {
    q: "¿Por qué la utilidad sale negativa?",
    a: "Porque el combustible (y el costo de remesa) superan las ventas del rango. Revisa rutas con viajes largos o ventas bajas.",
  },
  {
    q: "¿Qué pasa si reactivo una ruta inactiva con un nombre ya usado?",
    a: "El sistema te avisa con un error: ya existe una ruta activa con ese nombre. Renombra una de las dos para continuar.",
  },
];

export const ClientsRoutesHelpPage = () => {
  const { slug } = useParams();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Cómo funciona Clientes y Rutas
          </h1>
          <p className="text-sm text-slate-400">
            Guía para entender cómo se arman las rutas por localidad y cómo leer
            el rendimiento y la rentabilidad de cada ruta.
          </p>
        </div>
        <Link to={`/business/${slug}/clients-routes`}>
          <Button color="light" size="sm">
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Volver a Clientes y Rutas
          </Button>
        </Link>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.title} className="space-y-2">
          <h2 className="text-lg font-semibold text-white">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-relaxed text-slate-300"
            >
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          Preguntas frecuentes
        </h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4"
            >
              <p className="text-sm font-semibold text-white">{item.q}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
