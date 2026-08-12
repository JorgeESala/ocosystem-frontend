import { useState, useCallback, useEffect } from "react";
import { Card, Label, TextInput, Button, Alert, Spinner } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { changeCredentials } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { fetchMe } from "../services/api";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export default function ChangeCredentialsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (form.password !== form.confirm) {
        throw new Error("Las contraseñas no coinciden");
      }

      await changeCredentials({
        name: form.name,
        email: form.email,
        newPassword: form.password,
      });

      // Seguridad: forzar nuevo login
      logout();
      navigate("/login", { replace: true });
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudieron actualizar las credenciales.");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await fetchMe();
        setForm((prev) => ({
          ...prev,
          name: me.name,
          email: me.email,
        }));
      } catch {
        // Si algo falla, cerrar sesión por seguridad
        logout();
        navigate("/login", { replace: true });
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [logout, navigate]);
  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-gray-100">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="xl" />
          <p className="text-sm text-gray-400">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6 text-gray-100">
      <Card className="w-full max-w-md border border-gray-700 bg-gray-800 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold">
          Actualiza tus datos
        </h1>

        <p className="mb-6 text-center text-sm text-gray-400">
          Tu cuenta fue creada por un administrador. Por favor, completa tus
          datos para continuar.
        </p>

        {error && (
          <Alert color="failure" icon={HiInformationCircle} className="mb-4">
            <span className="font-medium">Error:</span> {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <Label htmlFor="name" className="text-gray-300">
              Nombre completo
            </Label>
            <TextInput
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="border-gray-600 bg-gray-700 text-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-gray-300">
              Correo electrónico
            </Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="border-gray-600 bg-gray-700 text-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-gray-300">
              Nueva contraseña
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

          {/* Confirm */}
          <div>
            <Label htmlFor="confirm" className="text-gray-300">
              Confirmar contraseña
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

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
