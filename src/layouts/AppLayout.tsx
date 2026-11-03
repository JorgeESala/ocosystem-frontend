import { Outlet } from "react-router-dom";
import SidebarApp from "../components/SidebarApp";
import BusinessTopBar from "../components/BusinessTopBar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <SidebarApp />

      <main className="flex-1 overflow-y-auto px-2 pt-14 md:pt-0">
        <BusinessTopBar />
        <Outlet />
      </main>
    </div>
  );
}
