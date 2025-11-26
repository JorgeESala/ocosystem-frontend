import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/reports">Reportes</Link> |{" "}
          <Link to="/graphs">Comparativas</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
