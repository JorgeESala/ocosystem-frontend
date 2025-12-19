import { Outlet } from "react-router-dom";
import SidebarApp from "../components/SidebarApp";
// si aún no existe, puedes comentar esa línea

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <SidebarApp />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-2 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
