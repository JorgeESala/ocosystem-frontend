import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
  SidebarCollapse,
} from "flowbite-react";
import { FaSignOutAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useAuthRole } from "../hooks/useAuthRole";
import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { BASE_MENU, BUSINESSES } from "@/business/business.config";
import { logoTargetFor } from "@/business/business.navigation";
import NotificationBell from "@/features/notification/components/NotificationBell";
import type { BusinessMenuItem } from "@/business/business.config";

const sidebarTheme = {
  root: {
    inner:
      "h-full overflow-y-auto overflow-x-hidden rounded bg-gray-50 px-3 py-2 dark:bg-gray-800",
  },
  item: {
    base: "flex items-center justify-start rounded-lg p-1.5 text-sm font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
    content: {
      base: "flex-1 truncate px-2",
    },
  },
  itemGroup: {
    base: "mt-2 space-y-0.5 border-t-0 pt-0 first:mt-0",
  },
  collapse: {
    button:
      "group flex w-full items-center rounded-lg p-1.5 text-sm font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
    list: "space-y-0.5 py-1",
  },
};

export default function SidebarApp() {
  const { isAuthenticated, logout } = useAuth();
  const { isAdmin } = useAuthRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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

  const visibleMenu = (menu: BusinessMenuItem[]) =>
    menu.filter((m) => !m.adminOnly || isAdmin);

  const renderMenu = (slug: string, menu: BusinessMenuItem[]) => {
    const base = `/business/${slug}/`;
    const ungrouped = menu.filter((m) => !m.group);
    const groupNames = [
      ...new Set(menu.filter((m) => m.group).map((m) => m.group as string)),
    ];

    const renderItem = (m: BusinessMenuItem) => {
      const MIcon = m.icon;
      return (
        <Link
          key={m.to}
          to={base + m.to}
          onClick={() => setMobileOpen(false)}
          className="block"
        >
          <SidebarItem icon={MIcon}>{m.label}</SidebarItem>
        </Link>
      );
    };

    return [
      ...ungrouped.map(renderItem),
      ...groupNames.map((group) => {
        const items = menu.filter((m) => m.group === group);
        const open = items.some((m) => pathname.startsWith(base + m.to));

        return (
          <SidebarCollapse key={group} label={group} open={open}>
            {items.map(renderItem)}
          </SidebarCollapse>
        );
      }),
    ];
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
          className={`fixed z-50 flex h-screen flex-col border-r border-gray-700 bg-gray-900 transition-all duration-300 md:sticky md:top-0 ${effectiveCollapsed ? "w-20" : "w-64"} ${mobileOpen ? "left-0" : "-left-full"} md:left-0`}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center px-4 py-4">
            {/* Logo / Home */}
            <Link
              to={logoTargetFor(user?.allowedBusinesses)}
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
            theme={sidebarTheme}
            className={`min-h-0 flex-1 bg-transparent ${effectiveCollapsed ? "w-20" : "w-64"}`}
          >
            <SidebarItems>
              <SidebarItemGroup>
                {allowedBusinesses.length === 1
                  ? (() => {
                      const b = allowedBusinesses[0];
                      const menu = visibleMenu(b.menu ?? BASE_MENU);

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

                      return renderMenu(b.slug, menu);
                    })()
                  : allowedBusinesses.map((b) => {
                      const menu = visibleMenu(b.menu ?? BASE_MENU);
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
                          {renderMenu(b.slug, menu)}
                        </SidebarCollapse>
                      );
                    })}
              </SidebarItemGroup>
            </SidebarItems>
          </Sidebar>

          {/* Logout */}
          <div className="shrink-0 px-4 py-4">
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
