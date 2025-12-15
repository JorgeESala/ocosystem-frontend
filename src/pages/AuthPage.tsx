import { useState, useCallback, useMemo } from "react";
import { Label, TextInput, Button, Card, Alert } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, LoginRequest, RegisterRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { HiInformationCircle } from "react-icons/hi";

/**
 * Interface defining the structure of the authentication form state.
 */
interface AuthFormState extends LoginRequest, RegisterRequest {
  confirm: string;
}

interface AuthPageProps {
  mode?: "login" | "register";
}

// --- Custom Hook for Form State Management (SoC) ---

/**
 * Custom hook to manage the form state and input changes for the AuthPage.
 * It provides the current form state and a standardized change handler.
 */
const useAuthForm = (initialState: AuthFormState) => {
  const [form, setForm] = useState<AuthFormState>(initialState);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prevForm) => ({ ...prevForm, [e.target.name]: e.target.value }));
  }, []);

  return { form, handleChange };
};

// --- Component Definition ---

export default function AuthPage({ mode = "login" }: AuthPageProps) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { login } = useAuth();

  const initialFormState = useMemo<AuthFormState>(
    () => ({
      name: "",
      email: "",
      password: "",
      confirm: "",
    }),
    [],
  );

  const { form, handleChange } = useAuthForm(initialFormState);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Encapsulates the core login/register API logic.
   */
  const handleAuth = async () => {
    if (!isLogin) {
      // Registration flow
      if (form.password !== form.confirm) {
        throw new Error("Las contraseñas no coinciden");
      }

      const { name, email, password } = form;

      await registerUser({ name, email, password });

      // Redirect to login after successful registration
      navigate("/login");
    } else {
      // Login flow
      const { email, password } = form;
      await login({ email, password });

      // Redirect to home and replace history entry (prevent back button to login)
      navigate("/", { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await handleAuth();
    } catch (err: any) {
      if (isLogin && (err.status === 401 || err.status === 404)) {
        setError("Correo y/o contraseña inválidos. Intenta de nuevo.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          `Error inesperado al intentar ${isLogin ? "iniciar sesión" : "registrar"}.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---

  const getButtonText = () => {
    if (loading) {
      return isLogin ? "Iniciando sesión..." : "Creando cuenta...";
    }
    return isLogin ? "Iniciar sesión" : "Registrarse";
  };

  const linkPath = isLogin ? "/register" : "/login";
  const linkText = isLogin ? "Crear cuenta" : "Iniciar sesión";
  const linkMessage = isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? ";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6 text-gray-100">
      <Card className="w-full max-w-md border border-gray-700 bg-gray-800 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {isLogin ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        {error && (
          <Alert color="failure" icon={HiInformationCircle} className="mb-4">
            <span className="font-medium">Error:</span> {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name Field (Registration Only) */}
          {!isLogin && (
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Nombre Completo
              </Label>
              <TextInput
                id="name"
                name="name"
                type="text"
                placeholder="Nombre completo"
                required
                value={form.name}
                onChange={handleChange}
                className="border-gray-600 bg-gray-700 text-gray-100"
              />
            </div>
          )}

          {/* Email Field */}
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

          {/* Password Field */}
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

          {/* Confirm Password Field (Registration Only) */}
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
            {getButtonText()}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          {linkMessage}
          <Link to={linkPath} className="text-blue-400 hover:underline">
            {linkText}
          </Link>
        </p>
      </Card>
    </div>
  );
}
