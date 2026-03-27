import type { User } from "@/utils/userType";

export type SessionStatus =
  | "anonymous"
  | "bootstrapping"
  | "authenticating"
  | "needs_onboarding"
  | "authenticated";

export interface SessionState {
  status: SessionStatus;
  token: string | null;
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
}
