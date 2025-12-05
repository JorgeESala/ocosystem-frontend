import { Link } from "react-router-dom";
import { useState } from "react";
import { FaStore, FaEgg, FaChartBar, FaFileAlt, FaBoxes } from "react-icons/fa";
import {
  GiChicken,
  GiFeather,
  GiCarrot,
  GiPig,
  GiPayMoney,
  GiReceiveMoney,
} from "react-icons/gi";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openBusiness, setOpenBusiness] = useState<string | null>(null);

  const businesses = [
    {
      name: "Sucursales",
      slug: "sucursales",
      icon: FaStore,
      color: "text-blue-400",
    },
    {
      name: "Pollo vivo",
      slug: "pollo-vivo",
      icon: GiFeather,
      color: "text-yellow-300",
    },
    { name: "Cerdo", slug: "cerdo", icon: GiPig, color: "text-pink-400" },
    { name: "Huevo", slug: "huevo", icon: FaEgg, color: "text-white-300" },
    {
      name: "Verduras",
      slug: "verduras",
      icon: GiCarrot,
      color: "text-orange-400",
    },
  ];

  const businessMenu = [
    { to: "Reports", label: "Reportes", icon: FaFileAlt },
    { to: "graphs", label: "Comparativas", icon: FaChartBar },
    { to: "SalesAndBatches", label: "Entradas y Ventas", icon: FaBoxes },
    { to: "expenses", label: "Gastos", icon: GiPayMoney },
    { to: "profit", label: "Ganancias", icon: GiReceiveMoney },
  ];

  return (
    <nav className="border-b border-gray-700 bg-gray-900 text-gray-200 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between md:justify-center">
          {/* Logo (left aligned mobile, centered desktop) */}
          <Link to="/" className="md:absolute md:left-8">
            <div className="flex items-center space-x-2">
              <GiChicken className="text-2xl text-blue-400" />
              <span className="text-xl font-bold">Ocosur</span>
            </div>
          </Link>

          {/* Desktop menu centered */}
          <div className="z-50 hidden space-x-6 md:flex">
            {businesses.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.slug} className="group relative">
                  <button className="flex items-center gap-2 text-gray-300 transition hover:text-white">
                    <Icon className={`text-xl ${b.color}`} />
                    {b.name}
                  </button>

                  {/* Dropdown desktop */}
                  <div className="absolute left-0 hidden w-48 rounded-lg bg-gray-800 p-2 shadow-lg group-hover:block">
                    {businessMenu.map((m) => {
                      const MIcon = m.icon;
                      return (
                        <Link
                          key={m.to}
                          to={`/business/${b.slug}/${m.to}`}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <MIcon />
                          {m.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hamburger right (only mobile) */}
          <button
            className="focus:outline-none md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-6 bg-gray-300 transition ${
                  mobileOpen ? "translate-y-2 rotate-45" : ""
                }`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-gray-300 transition ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-gray-300 transition ${
                  mobileOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`overflow-hidden bg-gray-800 transition-all md:hidden ${
          mobileOpen ? "max-h-[600px] py-4" : "max-h-0"
        }`}
      >
        <div className="space-y-3 px-4">
          {businesses.map((b) => {
            const Icon = b.icon;
            const isOpen = openBusiness === b.slug;

            return (
              <div key={b.slug}>
                <button
                  onClick={() => setOpenBusiness(isOpen ? null : b.slug)}
                  className="flex w-full items-center justify-between rounded-lg bg-gray-700 p-3 text-left text-gray-200"
                >
                  <span className="flex items-center gap-2">
                    <Icon className={`text-xl ${b.color}`} />
                    {b.name}
                  </span>
                  <span>{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="mt-2 ml-6 space-y-2">
                    {businessMenu.map((m) => {
                      const MIcon = m.icon;
                      return (
                        <Link
                          key={m.to}
                          to={`/business/${b.slug}/${m.to}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-300 hover:bg-gray-600 hover:text-white"
                        >
                          <MIcon />
                          {m.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
