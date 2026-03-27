import { useEffect } from "react";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const githubCallback = useAuthStore((state) => state.githubCallback);
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const sessionError = useAuthStore((state) => state.sessionError);
  const setSessionError = useAuthStore((state) => state.setSessionError);

  const code = searchParams.get("code");

  useEffect(() => {
    let isActive = true;

    if (!code) {
      setSessionError("GitHub did not return an authorization code.");
      return;
    }

    const completeAuthentication = async () => {
      try {
        console.log("Code received:", code);
        await githubCallback(code);
        await bootstrapSession();

        if (!isActive) {
          return;
        }

        const latestStatus = useAuthStore.getState().sessionStatus;
        console.log("auth callback page latestStatus: ", latestStatus);
        if (latestStatus === "needs_onboarding") {
          navigate("/onboarding", { replace: true });
          return;
        }
        console.log("auth callback page navigating to projects");
        navigate("/projects", { replace: true });
        console.log("auth callback page navigated to projects");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setSessionError(
          error instanceof Error
            ? error.message
            : "Unable to complete GitHub authentication."
        );
      }
    };

    void completeAuthentication();

    return () => {
      isActive = false;
    };
  }, [bootstrapSession, code, githubCallback, navigate, setSessionError]);

  return (
    <AuthShell>
      <AuthCard
        description="We’re exchanging your GitHub authorization code, restoring the app session, and checking whether onboarding is required."
        eyebrow="Callback"
        title="Finishing sign-in"
      >
        {sessionError ? (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-error/20 bg-error/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-error" />
                <div>
                  <p className="text-sm font-semibold text-error">Auth failed</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {sessionError}
                  </p>
                </div>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link to="/login">Back to login</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-[24px] border border-outline-variant/10 bg-surface-container-low p-4">
            <LoaderCircle className="h-6 w-6 animate-spin text-tertiary-container" />
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {sessionStatus === "authenticating"
                  ? "Authenticating with GitHub"
                  : "Bootstrapping your session"}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Please hold for a moment while we finish the handoff.
              </p>
            </div>
          </div>
        )}
      </AuthCard>
    </AuthShell>
  );
}
