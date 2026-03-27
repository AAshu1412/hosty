import { Navigate, Outlet } from "react-router-dom";

import { useSession } from "@/hooks/use-session";

export function GuestRoute() {
  const session = useSession();

  if (session.isBootstrapping) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-on-surface">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-outline-variant border-t-tertiary-container" />
          <p className="text-sm text-on-surface-variant">
            Preparing authentication flow...
          </p>
        </div>
      </div>
    );
  }

  if (session.isAuthenticated) {
    return <Navigate replace to="/projects" />;
  }

  if (session.needsOnboarding) {
    return <Navigate replace to="/onboarding" />;
  }

  return <Outlet />;
}
