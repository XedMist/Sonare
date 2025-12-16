import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { PlayerProvider } from "../context/PlayerContext";
import { AppShell } from "../components/layout/AppShell";

export default function AppLayout() {
  return (
    <AuthGuard>
      <PlayerProvider>
        <AppShell />
      </PlayerProvider>
    </AuthGuard>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
