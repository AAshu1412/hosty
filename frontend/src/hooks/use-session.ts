import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import { useJWTTokenStore } from "@/store/jwtTokenStore";
import type { SessionState } from "@/types/auth";

function userNeedsOnboarding(email: string | null | undefined) {
  return !email || email.trim().length === 0;
}

export function useSession(): SessionState {
  const location = useLocation();
  const token = useJWTTokenStore((state) => state.jwtToken);
  const user = useAuthStore((state) => state.user);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);

  useEffect(() => {
    const isAuthRoute =
      location.pathname === "/login" ||
      location.pathname === "/auth/callback";

    if (!token && sessionStatus !== "anonymous") {
      return;
    }

    if (!token || isAuthRoute) {
      return;
    }

    if (sessionStatus === "anonymous" || sessionStatus === "bootstrapping") {
      void bootstrapSession();
    }
  }, [bootstrapSession, location.pathname, sessionStatus, token]);

  const needsOnboarding = Boolean(
    token &&
      user &&
      !user.has_completed_onboarding &&
      userNeedsOnboarding(user.email)
  );
  const isAuthenticated = Boolean(token && user && !needsOnboarding);
  const isBootstrapping = sessionStatus === "bootstrapping";

  return {
    status: needsOnboarding ? "needs_onboarding" : sessionStatus,
    token,
    user,
    isBootstrapping,
    isAuthenticated,
    needsOnboarding,
  };
}
