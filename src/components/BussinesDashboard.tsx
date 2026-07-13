import { FaBoxes } from "react-icons/fa";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { Link, useParams } from "react-router-dom";
import ChecklistDashboardWidget from "@/features/branches/checklist/components/ChecklistDashboardWidget";

export default function BusinessDashboard() {
  const { slug } = useParams();

  const menu = [
    {
      to: `/business/${slug}/salesAndBatches`,
      icon: <FaBoxes className="mb-3 text-4xl text-yellow-400" />,
      title: "Entradas y ventas",
      desc: "Registra remesas y ventas diarias.",
    },
    {
      to: `/business/${slug}/expenses`,
      icon: <GiPayMoney className="mb-3 text-4xl text-rose-400" />,
      title: "Gastos",
      desc: "Registra y consulta gastos.",
    },
    {
      to: `/business/${slug}/accounting`,
      icon: <GiReceiveMoney className="mb-3 text-4xl text-purple-400" />,
      title: "Contabilidad",
      desc: "Revisa cuentas por pagar.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <h1 className="mb-8 text-center text-3xl font-bold">
        {slug ? slug.toUpperCase() : ""}
      </h1>

      <div className="mx-auto max-w-5xl space-y-6">
        {slug === "sucursales" && <ChecklistDashboardWidget />}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="flex flex-col items-center justify-center rounded-xl bg-gray-800 p-6 shadow-lg transition hover:bg-gray-700"
            >
              {m.icon}
              <h2 className="text-lg font-semibold">{m.title}</h2>
              <p className="mt-1 text-center text-sm text-gray-400">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
