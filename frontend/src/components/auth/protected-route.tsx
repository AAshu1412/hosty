import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "@/hooks/use-session";

export function ProtectedRoute() {
  const location = useLocation();
  const session = useSession();

  if (session.isBootstrapping) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-on-surface">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-outline-variant border-t-tertiary-container" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
              Checking session
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Restoring your workspace access and profile state.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session.token) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (session.needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate replace to="/onboarding" />;
  }

  if (session.isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate replace to="/login" />;
}
