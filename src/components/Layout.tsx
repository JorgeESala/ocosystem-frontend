import { Outlet } from "react-router-dom";
import SidebarApp from "./SidebarApp";

export default function Layout() {
  return (
    <div className="flex">
      <SidebarApp />
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
}
