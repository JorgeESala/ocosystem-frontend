import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaStore,
  FaEgg,
  FaChartBar,
  FaFileAlt,
  FaBoxes,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  GiChicken,
  GiFeather,
  GiCarrot,
  GiPig,
  GiPayMoney,
  GiReceiveMoney,
} from "react-icons/gi";
import { MdOutlineLocalGroceryStore } from "react-icons/md";

// Assuming AuthContext provides these hooks
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openBusiness, setOpenBusiness] = useState<string | null>(null);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate("/");
    } else {
      navigate("/login");
    } // Close mobile menu after an auth action
    setMobileOpen(false);
  };

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
    {
      name: "Abarrotes",
      slug: "abarrotes",
      icon: MdOutlineLocalGroceryStore,
      color: "text-blue-300",
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
        {/* Top bar: using justify-between for 3-column layout (Logo | Menu | Auth/Hamburger) */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo (Left side) */}
          <Link
            to="/" /* Removed absolute positioning to keep it within the flex flow */
          >
            <div className="flex items-center space-x-2">
              <GiChicken className="text-2xl text-blue-400" />
              <span className="text-xl font-bold">Ocosur</span>
            </div>
          </Link>
          {/* Desktop menu centered (Center column) */}
          <div className="flex flex-1 justify-center">
            {/* Use flex-1 to take available space and justify-center to center content */}
            {isAuthenticated && ( // Only display menu if authenticated
              <div className="z-50 hidden space-x-6 md:flex">
                {businesses.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.slug} className="group relative">
                      {/* Changed from button to Link for better navigation flow */}
                      <Link
                        to={`/business/${b.slug}`}
                        className="flex items-center gap-2 text-gray-300 transition hover:text-white"
                      >
                        <Icon className={`text-xl ${b.color}`} />
                        {b.name}
                      </Link>
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
            )}
          </div>
          {/* Auth Button and Hamburger (Right side) */}
          <div className="flex items-center gap-4">
            {/* Auth Button (Desktop Only) */}
            <button
              onClick={handleAuthClick}
              className={`hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition md:flex ${isAuthenticated ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}`}
            >
              {isAuthenticated ? (
                <>
                  <FaSignOutAlt className="text-lg" />
                  Cerrar Sesión
                </>
              ) : (
                <>
                  <FaSignInAlt className="text-lg" />
                  Iniciar Sesión
                </>
              )}
            </button>
            {/* Hamburger right (mobile only) */}
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
      </div>
      {/* Mobile dropdown */}
      <div
        className={`overflow-hidden bg-gray-800 transition-all md:hidden ${
          mobileOpen ? "max-h-[800px] py-4" : "max-h-0" // Increased height to accommodate the Auth button
        }`}
      >
        <div className="space-y-3 px-4">
          {isAuthenticated &&
            businesses.map((b) => {
              // Only render navigation links if authenticated
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
          {/* Auth Button (Mobile Footer) */}
          <button
            onClick={handleAuthClick}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-lg font-bold transition ${isAuthenticated ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}`}
          >
            {isAuthenticated ? (
              <>
                <FaSignOutAlt className="text-xl" />
                Logout
              </>
            ) : (
              <>
                <FaSignInAlt className="text-xl" />
                Login
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
