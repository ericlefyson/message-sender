import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRepositories } from "../contexts/RepositoryContext";
import logo from "../assets/images/logos/logo.png";

export function LoginScreen() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { authRepository } = useRepositories();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      setError("Por favor, digite seu nickname");
      return;
    }

    if (!password.trim()) {
      setError("Por favor, digite sua senha");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const cleanNickname = nickname.trim().startsWith("@")
        ? nickname.trim()
        : `@${nickname.trim()}`;
      const user = await authRepository.login(cleanNickname, password.trim());
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
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nickname
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="@joao ou joao"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              O @ será adicionado automaticamente se você não incluir
            </p>
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
        </form>
      </div>
    </div>
  );
}
