import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/reports">Reports</Link> |{" "}
          <Link to="/comparisons">Comparisons</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
