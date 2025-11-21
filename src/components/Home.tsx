import { Link } from "react-router-dom";
import { FaStore } from "react-icons/fa";
import { GiBigEgg, GiCarrot, GiFeather, GiPig } from "react-icons/gi";

export default function Home() {
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
    { name: "Huevo", slug: "huevo", icon: GiBigEgg, color: "text-white-300" },
    {
      name: "Verduras",
      slug: "verduras",
      icon: GiCarrot,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Unidades de negocio
      </h1>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((b) => {
          const Icon = b.icon;
          return (
            <Link
              key={b.slug}
              to={`/business/${b.slug}`}
              className="flex flex-col items-center justify-center rounded-xl bg-gray-800 p-6 shadow-lg transition hover:bg-gray-700"
            >
              <Icon className={`mb-3 text-4xl ${b.color}`} />
              <h2 className="text-lg font-semibold">{b.name}</h2>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
