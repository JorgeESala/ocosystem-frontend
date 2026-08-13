import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
  SidebarCollapse,
} from "flowbite-react";
import { FaSignOutAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { BASE_MENU, BUSINESSES } from "@/business/business.config";
import NotificationBell from "@/features/notification/components/NotificationBell";

export default function SidebarApp() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Desktop collapse
  const [collapsed, setCollapsed] = useState(false);
  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const effectiveCollapsed = !isMobile && collapsed;
  const { user } = useAuth();

  const allowedBusinesses = BUSINESSES.filter((b) =>
    user?.allowedBusinesses.includes(b.key),
  );

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* 🍔 Mobile hamburger */}
      {isAuthenticated && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 rounded-md bg-gray-800 p-2 text-gray-200 md:hidden"
        >
          <RxHamburgerMenu />
        </button>
      )}

      {/* 🌑 Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 📦 Sidebar */}
      {isAuthenticated && (
        <aside
          className={`fixed z-50 h-screen border-r border-gray-700 bg-gray-900 transition-all duration-300 md:sticky md:top-0 ${effectiveCollapsed ? "w-20" : "w-64"} ${mobileOpen ? "left-0" : "-left-full"} md:left-0`}
        >
          {/* Header */}
          <div className="flex items-center px-4 py-4">
            {/* Logo / Home */}
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex flex-shrink-0 items-center gap-2 overflow-hidden"
            >
              <img
                src="/logo.png"
                className="h-8 w-8 flex-shrink-0"
                alt="Ocosur"
              />
              {!effectiveCollapsed && (
                <span className="text-xl font-bold whitespace-nowrap text-white">
                  Ocosur
                </span>
              )}
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Notification bell - hidden when collapsed or no branches access */}
            {!effectiveCollapsed &&
              user?.allowedBusinesses.includes("BRANCHES") && (
                <NotificationBell />
              )}

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-1 hidden h-8 w-8 items-center justify-center rounded-md pl-2 text-gray-400 hover:bg-gray-800 hover:text-white md:flex"
              aria-label="Colapsar sidebar"
            >
              {effectiveCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>

          {/* Menu */}
          <Sidebar
            className={`bg-transparent ${effectiveCollapsed ? "w-20" : "w-64"}`}
          >
            <SidebarItems>
              <SidebarItemGroup>
                {allowedBusinesses.length === 1
                  ? (() => {
                      const b = allowedBusinesses[0];
                      const menu = b.menu ?? BASE_MENU;

                      if (effectiveCollapsed) {
                        return (
                          <SidebarItem
                            key={b.slug}
                            icon={b.icon}
                            title={b.name}
                            onClick={() => navigate(`/business/${b.slug}`)}
                          />
                        );
                      }

                      return menu.map((m) => {
                        const MIcon = m.icon;
                        return (
                          <Link
                            key={m.to}
                            to={`/business/${b.slug}/${m.to}`}
                            onClick={() => setMobileOpen(false)}
                            className="block"
                          >
                            <SidebarItem icon={MIcon}>{m.label}</SidebarItem>
                          </Link>
                        );
                      });
                    })()
                  : allowedBusinesses.map((b) => {
                      const menu = b.menu ?? BASE_MENU;
                      const Icon = b.icon;

                      if (effectiveCollapsed) {
                        return (
                          <SidebarItem
                            key={b.slug}
                            icon={Icon}
                            title={b.name}
                            onClick={() => navigate(`/business/${b.slug}`)}
                          />
                        );
                      }

                      return (
                        <SidebarCollapse
                          key={b.slug}
                          icon={Icon}
                          label={b.name}
                        >
                          {menu.map((m) => {
                            const MIcon = m.icon;

                            return (
                              <Link
                                key={m.to}
                                to={`/business/${b.slug}/${m.to}`}
                                onClick={() => setMobileOpen(false)}
                                className="block"
                              >
                                <SidebarItem icon={MIcon}>
                                  {m.label}
                                </SidebarItem>
                              </Link>
                            );
                          })}
                        </SidebarCollapse>
                      );
                    })}
              </SidebarItemGroup>
            </SidebarItems>
          </Sidebar>

          {/* Logout */}
          <div className="absolute bottom-0 w-full px-4 py-4">
            <button
              onClick={handleLogout}
              title={effectiveCollapsed ? "Cerrar sesión" : undefined}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
            >
              <FaSignOutAlt />
              {!effectiveCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
