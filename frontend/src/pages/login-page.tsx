import { ShieldCheck } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
// import { useEffect } from "react";

export function LoginPage() {
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  // const urlParams = new URLSearchParams(window.location.search);
  // const code = urlParams.get('code');
  const handleLogin = async () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    // const redirectUri = `${window.location.origin}/auth/callback`;
    // const params = new URLSearchParams({
    //   client_id: clientId,
    //   redirect_uri: redirectUri,
    //   scope: "read:user user:email repo",
    // });

    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
  };


  // useEffect(() => {
  //   if (code) {
  //     console.log("Code received:", code);
  //     exchangeCode(code);
  //   }
  // }, [code]);

  // const exchangeCode = async (code: string) => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/github/callback', {
  //       method: 'POST',
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ code }),  // ✅ FIXED: Object!
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTPerro`);
  //     }

  //     const data = await response.json();
  //     console.log("Data received:", JSON.stringify(data, null, 2));
  //     const { access_token, user } = data;
      
  //     console.log('✅ Token:', access_token?.slice(-10));
  //     console.log('✅ User:', user?.login);
      
  //     localStorage.setItem('github_token', access_token);
      
  //     // Clear URL params
  //     window.history.replaceState({}, '', window.location.pathname);
      
  //   } catch (error) {
  //     console.error('❌ Auth failed:', error);
  //   }
  // };


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
            onClick={async () => await handleLogin()}
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
