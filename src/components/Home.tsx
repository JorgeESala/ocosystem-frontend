import { FaChartBar, FaFileAlt, FaBoxes } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Dashboard Principal
      </h1>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/Reports"
          className="flex flex-col items-center justify-center rounded-xl bg-gray-800 p-6 shadow-lg transition hover:bg-gray-700"
        >
          <FaFileAlt className="mb-3 text-4xl text-blue-400" />
          <h2 className="text-lg font-semibold">Tabla de reportes</h2>
          <p className="mt-1 text-center text-sm text-gray-400">
            Consulta y descarga reportes de ventas diarias o mensuales.
          </p>
        </Link>

        <Link
          to="/ComparisonGraphs"
          className="flex flex-col items-center justify-center rounded-xl bg-gray-800 p-6 shadow-lg transition hover:bg-gray-700"
        >
          <FaChartBar className="mb-3 text-4xl text-green-400" />
          <h2 className="text-lg font-semibold">Gráficas comparativas</h2>
          <p className="mt-1 text-center text-sm text-gray-400">
            Visualiza comparaciones entre sucursales, fechas o remesas.
          </p>
        </Link>

        <Link
          to="/SalesAndBatches"
          className="flex flex-col items-center justify-center rounded-xl bg-gray-800 p-6 shadow-lg transition hover:bg-gray-700"
        >
          <FaBoxes className="mb-3 text-4xl text-yellow-400" />
          <h2 className="text-lg font-semibold">Entradas y ventas</h2>
          <p className="mt-1 text-center text-sm text-gray-400">
            Registra remesas y ventas diarias de forma rápida y organizada.
          </p>
        </Link>
      </div>
    </div>
  );
}
