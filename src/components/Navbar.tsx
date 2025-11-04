import { Link, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaFileAlt,
  FaBoxes,
  FaHome,
  FaSignOutAlt,
} from "react-icons/fa";
import { GiChicken } from "react-icons/gi";

export default function Navbar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Inicio", icon: <FaHome /> },
    { to: "/Reports", label: "Reportes", icon: <FaFileAlt /> },
    {
      to: "/ComparisonGraphs",
      label: "Tablas Comparativas",
      icon: <FaChartBar />,
    },
    { to: "/SalesAndBatches", label: "Entradas y Ventas", icon: <FaBoxes /> },
  ];

  return (
    <nav className="border-b border-gray-700 bg-gray-900 text-gray-200 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/">
            <div className="flex items-center space-x-2">
              <GiChicken className="text-2xl text-blue-400" />
              <span className="text-xl font-bold">Ocosur</span>
            </div>
          </Link>
          {/* Links */}
          <div className="hidden space-x-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 transition ${
                  location.pathname === link.to
                    ? "font-semibold text-blue-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Logout (placeholder) */}
          <button
            onClick={() => alert("Cerrar sesión")}
            className="flex items-center gap-2 text-gray-400 transition hover:text-red-400"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
