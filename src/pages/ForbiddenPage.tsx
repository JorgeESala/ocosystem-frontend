export default function ForbiddenPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-red-600">403</h1>
      <p className="mt-4 text-xl">No tienes permisos para acceder</p>
      <p className="mt-2 text-gray-500">
        Contacta al administrador si crees que es un error.
      </p>
    </div>
  );
}
