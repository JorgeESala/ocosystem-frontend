import { FaChartBar, FaFileAlt, FaBoxes } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";

export default function BusinessDashboard() {
  const { slug } = useParams();

  const menu = [
    {
      to: `/business/${slug}/reports`,
      icon: <FaFileAlt className="mb-3 text-4xl text-blue-400" />,
      title: "Tabla de reportes",
      desc: "Consulta y descarga reportes.",
    },
    {
      to: `/business/${slug}/graphs`,
      icon: <FaChartBar className="mb-3 text-4xl text-green-400" />,
      title: "Gráficas comparativas",
      desc: "Visualiza comportamiento por fechas.",
    },
    {
      to: `/business/${slug}/sales`,
      icon: <FaBoxes className="mb-3 text-4xl text-yellow-400" />,
      title: "Entradas y ventas",
      desc: "Registra remesas y ventas diarias.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <h1 className="mb-8 text-center text-3xl font-bold">
        {slug ? slug.toUpperCase() : ""}
      </h1>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {menu.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="flex flex-col items-center justify-center rounded-xl bg-gray-800 p-6 shadow-lg transition hover:bg-gray-700"
          >
            {m.icon}
            <h2 className="text-lg font-semibold">{m.title}</h2>
            <p className="mt-1 text-center text-sm text-gray-400">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
