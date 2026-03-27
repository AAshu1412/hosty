import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { Navigate } from "react-router-dom";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useAuthStore } from "@/store/authStore";

export function OnboardingPage() {
  const session = useSession();
  const addEmail = useAuthStore((state) => state.addEmail);
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);
  const [email, setEmail] = useState(session.user?.user.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedEmail = useMemo(
    () => session.user?.user.email ?? "",
    [session.user?.user.email]
  );

  if (!session.token) {
    return <Navigate replace to="/login" />;
  }

  if (session.isAuthenticated) {
    return <Navigate replace to="/projects" />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Email is required to finish onboarding.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await addEmail(normalizedEmail);
      await bootstrapSession();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save your email."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard
        description="We only need one more thing before we open your workspace. Add an email address so deployment and onboarding messaging has a reliable destination."
        eyebrow="Onboarding"
        title="Complete your profile"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-[24px] border border-outline-variant/10 bg-surface-container-low p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
              GitHub profile
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-high">
                {session.user?.user.avatar_url ? (
                  <img
                    alt={session.user.user.name}
                    className="h-full w-full object-cover"
                    src={session.user.user.avatar_url}
                  />
                ) : null}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {session.user?.user.name || session.user?.user.username}
                </p>
                <p className="text-sm text-on-surface-variant">
                  @{session.user?.user.username}
                </p>
              </div>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
              Email address
            </span>
            <input
              autoComplete="email"
              className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/30"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              type="email"
              value={email}
            />
          </label>

          {suggestedEmail ? (
            <p className="text-xs text-on-surface-variant">
              GitHub suggested: <span className="text-on-surface">{suggestedEmail}</span>
            </p>
          ) : null}

          {error ? (
            <div className="rounded-[20px] border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
            <MailCheck className="h-4 w-4" />
            {isSubmitting ? "Saving email..." : "Finish onboarding"}
          </Button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
