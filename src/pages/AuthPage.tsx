import { useState } from "react";
import { Label, TextInput, Button, Card, Alert } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../services/api";

export default function AuthPage({
  mode = "login",
}: {
  mode?: "login" | "register";
}) {
  const isLogin = mode === "login";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (!isLogin) {
        if (form.password !== form.confirm) {
          setError("Las contraseñas no coinciden.");
          setLoading(false);
          return;
        }

        await registerUser({
          name: form.email.split("@")[0], // temporal si no pides name en UI
          email: form.email,
          password: form.password,
        });

        navigate("/login");
        return;
      }

      const res = await loginUser({
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.token);

      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6 text-gray-100">
      <Card className="w-full max-w-md border border-gray-700 bg-gray-800 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {isLogin ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email" className="text-gray-300">
              Correo Electrónico
            </Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              placeholder="correo@example.com"
              required
              value={form.email}
              onChange={handleChange}
              className="border-gray-600 bg-gray-700 text-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-300">
              Contraseña
            </Label>
            <TextInput
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="border-gray-600 bg-gray-700 text-gray-100"
            />
          </div>

          {!isLogin && (
            <div>
              <Label htmlFor="confirm" className="text-gray-300">
                Confirmar Contraseña
              </Label>
              <TextInput
                id="confirm"
                name="confirm"
                type="password"
                required
                value={form.confirm}
                onChange={handleChange}
                className="border-gray-600 bg-gray-700 text-gray-100"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? isLogin
                ? "Entrando..."
                : "Creando cuenta..."
              : isLogin
                ? "Entrar"
                : "Registrarme"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          {isLogin ? (
            <>
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-blue-400 hover:underline">
                Crea una aquí
              </Link>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                Inicia sesión
              </Link>
            </>
          )}
        </p>
      </Card>
    </div>
  );
}
