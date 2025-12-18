import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarToggle,
  NavbarCollapse,
  Button,
} from "flowbite-react";
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
  GiFeather,
  GiCarrot,
  GiPig,
  GiPayMoney,
  GiReceiveMoney,
} from "react-icons/gi";
import { MdOutlineLocalGroceryStore } from "react-icons/md";

import { useAuth } from "../context/AuthContext";

export default function NavbarApp() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate("/");
    } else {
      navigate("/login");
    }
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
    { name: "Huevo", slug: "huevo", icon: FaEgg, color: "text-white" },
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
    <Navbar
      fluid
      rounded={false}
      className="border-b border-gray-700 bg-gray-900 text-gray-200 shadow-md"
    >
      {/* Brand */}
      <NavbarBrand as={Link} href="/home" className="flex items-center gap-2">
        <img src="/logo.png" className="h-8 w-auto" alt="Logo Ocosur" />
        <span className="text-xl font-bold text-gray-100">Ocosur</span>
      </NavbarBrand>

      {/* Right side */}
      <div className="flex items-center gap-3 md:order-2">
        <Button
          onClick={handleAuthClick}
          color={isAuthenticated ? "failure" : "success"}
          className="hidden md:flex"
        >
          {isAuthenticated ? (
            <>
              <FaSignOutAlt className="mr-2" /> Cerrar Sesión
            </>
          ) : (
            <>
              <FaSignInAlt className="mr-2" /> Iniciar Sesión
            </>
          )}
        </Button>
        <NavbarToggle />
      </div>

      {/* Menu */}
      <NavbarCollapse className="w-full md:order-1 md:flex md:flex-1 md:justify-center">
        {isAuthenticated &&
          businesses.map((b) => {
            const Icon = b.icon;
            return (
              <details
                key={b.slug}
                className="group w-full md:relative md:w-auto"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white md:justify-start md:gap-2 md:hover:bg-transparent">
                  <span className="flex items-center gap-2">
                    <Icon className={`text-xl ${b.color}`} />
                    <span className="font-medium">{b.name}</span>
                  </span>
                  <span className="md:hidden">▾</span>
                </summary>

                <div className="mt-2 space-y-1 pl-6 md:absolute md:left-0 md:mt-0 md:hidden md:rounded-lg md:bg-gray-800 md:p-2 md:pl-0 md:group-open:block">
                  {businessMenu.map((m) => {
                    const MIcon = m.icon;
                    return (
                      <Link
                        key={m.to}
                        to={`/business/${b.slug}/${m.to}`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <MIcon />
                        {m.label}
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          })}

        {/* Mobile auth */}
        <div className="mt-4 md:hidden">
          <Button
            onClick={handleAuthClick}
            color={isAuthenticated ? "failure" : "success"}
            className="w-full"
          >
            {isAuthenticated ? (
              <>
                <FaSignOutAlt className="mr-2" /> Cerrar Sesión
              </>
            ) : (
              <>
                <FaSignInAlt className="mr-2" /> Iniciar Sesión
              </>
            )}
          </Button>
        </div>
      </NavbarCollapse>
    </Navbar>
  );
}
