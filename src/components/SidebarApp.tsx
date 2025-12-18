import { Link, useNavigate } from "react-router-dom";
import { Sidebar, SidebarItem, SidebarItemGroup } from "flowbite-react";
import {
  FaStore,
  FaEgg,
  FaChartBar,
  FaFileAlt,
  FaBoxes,
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

export default function SidebarApp() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const businesses = [
    { name: "Sucursales", slug: "sucursales", icon: FaStore },
    { name: "Pollo vivo", slug: "pollo-vivo", icon: GiFeather },
    { name: "Cerdo", slug: "cerdo", icon: GiPig },
    { name: "Huevo", slug: "huevo", icon: FaEgg },
    { name: "Verduras", slug: "verduras", icon: GiCarrot },
    { name: "Abarrotes", slug: "abarrotes", icon: MdOutlineLocalGroceryStore },
  ];

  const businessMenu = [
    { to: "Reports", label: "Reportes", icon: FaFileAlt },
    { to: "graphs", label: "Comparativas", icon: FaChartBar },
    { to: "SalesAndBatches", label: "Entradas y Ventas", icon: FaBoxes },
    { to: "expenses", label: "Gastos", icon: GiPayMoney },
    { to: "profit", label: "Ganancias", icon: GiReceiveMoney },
  ];

  return (
    <Sidebar
      aria-label="Sidebar"
      className="h-screen w-64 border-r border-gray-700 bg-gray-900"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 text-white">
        <img src="/logo.png" className="h-8" alt="Ocosur" />
        <span className="text-xl font-bold">Ocosur</span>
      </div>

      {isAuthenticated && (
        <SidebarItemGroup className="px-2">
          {businesses.map((b) => {
            const Icon = b.icon;
            return (
              <details key={b.slug} className="group rounded-lg text-gray-300">
                <summary className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-800 hover:text-white">
                  <Icon className="text-lg" />
                  {b.name}
                </summary>

                <div className="mt-1 ml-6 space-y-1">
                  {businessMenu.map((m) => {
                    const MIcon = m.icon;
                    return (
                      <Link
                        key={m.to}
                        to={`/business/${b.slug}/${m.to}`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
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
        </SidebarItemGroup>
      )}

      {/* Logout */}
      {isAuthenticated && (
        <div className="mt-auto px-4 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
          >
            <FaSignOutAlt />
            Cerrar sesión
          </button>
        </div>
      )}
    </Sidebar>
  );
}
