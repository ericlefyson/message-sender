import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRepositories } from "../contexts/RepositoryContext";
import logo from "../assets/images/logos/logo.png";

interface LoginScreenProps {
  onShowRegister: () => void;
}

export function LoginScreen({ onShowRegister }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { authRepository } = useRepositories();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Por favor, digite seu email");
      return;
    }

    if (!password.trim()) {
      setError("Por favor, digite sua senha");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const user = await authRepository.login(email.trim(), password.trim());
      login(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <img className="w-auto h-32" src={logo} />
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Message Sender
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onShowRegister}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium transition"
              disabled={isLoading}
            >
              Não tem uma conta? Criar conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
