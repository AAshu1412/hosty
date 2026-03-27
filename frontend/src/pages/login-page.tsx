import { ShieldCheck } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export function LoginPage() {
  const sessionStatus = useAuthStore((state) => state.sessionStatus);

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read:user user:email repo",
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  };

  return (
    <AuthShell>
      <AuthCard
        description="Authorize with github and start shipping, without worries - with a single chick"
        eyebrow="Login"
        title="Continue with GitHub"
      >
        <div className="space-y-4">
          <Button
            className="w-full justify-between"
            onClick={handleLogin}
            size="lg"
          >
            <span className="inline-flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-on-primary text-[11px] font-black text-primary">
                G
              </span>
              Sign in with GitHub
            </span>
            <ShieldCheck className="h-4 w-4" />
          </Button>


          {sessionStatus === "authenticating" ? (
            <p className="text-sm text-tertiary-container">
              GitHub authentication is already in progress.
            </p>
          ) : null}
        </div>
      </AuthCard>
    </AuthShell>
  );
}
