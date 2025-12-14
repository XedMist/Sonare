import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button, TextField } from "../components/ui";
import Dither from "../components/Dither";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Iniciar Sesión - Sonare" },
    { name: "description", content: "Inicia sesión en tu cuenta de Sonare" },
  ];
}

// ============================================
// LOGO SONARE
// ============================================

const SonareLogo = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary-500/40 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
      
      {/* Logo container */}
      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/30">
        {/* Sound wave logo */}
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white">
          <circle cx="24" cy="24" r="6" fill="currentColor" />
          <path 
            d="M24 10C31.732 10 38 16.268 38 24C38 31.732 31.732 38 24 38" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round"
            opacity="0.9"
          />
          <path 
            d="M24 4C35.046 4 44 12.954 44 24C44 35.046 35.046 44 24 44" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round"
            opacity="0.5"
          />
          <path 
            d="M24 16C28.418 16 32 19.582 32 24C32 28.418 28.418 32 24 32" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
    
    <div className="text-center">
      <h1 className="text-3xl font-bold text-surface-50 tracking-tight">Sonare</h1>
      <p className="text-surface-400 mt-1">Tu música personal en streaming</p>
    </div>
  </div>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to app when authenticated (but only after auth state is loaded)
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ username, password });
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dithering Background */}
      <div className="absolute inset-0 z-0">
        <Dither
          waveColor={[0.5, 0.3, 0.7]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.6}
          colorNum={4}
          waveAmplitude={0.25}
          waveFrequency={2}
          waveSpeed={0.02}
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900/80 via-surface-900/60 to-surface-900/90 z-[1]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] z-[1]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-10">
          <Link to="/" className="inline-block w-full">
            <SonareLogo />
          </Link>
        </div>

        {/* Login form */}
        <div className="w-full bg-surface-800/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-surface-700/30">
          <h2 className="text-2xl font-bold text-surface-50 text-center mb-6">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField
              label="Usuario"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              required
              autoComplete="username"
              autoFocus
            />

            <div className="relative">
              <TextField
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-surface-400 hover:text-surface-50 transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-500 text-white hover:bg-primary-400 shadow-lg shadow-primary-500/25"
              size="lg"
              isLoading={isLoading}
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-700/50 text-center">
            <p className="text-surface-400">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 hover:underline font-medium transition-colors">
                Regístrate en Sonare
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home link */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="text-surface-400 hover:text-surface-200 text-sm transition-colors inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}