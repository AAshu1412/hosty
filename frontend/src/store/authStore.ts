import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SERVER_URL } from "../lib/constants";
import type { SessionStatus } from "../types/auth";
import type { User } from "../utils/userType";
import type { APIResponse } from "../utils/apiResponseType";
import { useJWTTokenStore } from "./jwtTokenStore";

interface AuthStoreState {
  bootstrapSession: () => Promise<void>;
  githubCallback: (code: string) => Promise<APIResponse<null>>;
  user: User | null;
  sessionError: string | null;
  sessionStatus: SessionStatus;
  getUser: () => Promise<APIResponse<User>>;
  addEmail: (email: string) => Promise<APIResponse<null>>;
  clearSession: () => void;
  setSessionError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    (set, get) => ({
      user: null,
      sessionError: null,
      sessionStatus: useJWTTokenStore.getState().jwtToken
        ? "bootstrapping"
        : "anonymous",

      setSessionError: (error) => {
        set({ sessionError: error });
      },

      clearSession: () => {
        useJWTTokenStore.getState().clearToken();
        set({
          user: null,
          sessionError: null,
          sessionStatus: "anonymous",
        });
      },

      bootstrapSession: async () => {
        const token = useJWTTokenStore.getState().jwtToken;

        if (!token) {
          set({
            user: null,
            sessionError: null,
            sessionStatus: "anonymous",
          });
          return;
        }

        set({
          sessionError: null,
          sessionStatus: "bootstrapping",
        });

        try {
          const response = await get().getUser();
          const hasEmail = Boolean(response.data?.user.email?.trim());

          set({
            user: response.data,
            sessionStatus: hasEmail ? "authenticated" : "needs_onboarding",
          });
        } catch (error) {
          useJWTTokenStore.getState().clearToken();
          set({
            user: null,
            sessionError:
              error instanceof Error
                ? error.message
                : "Failed to restore your session.",
            sessionStatus: "anonymous",
          });
        }
      },

      githubCallback: async (code: string): Promise<APIResponse<null>> => {
        set({
          sessionError: null,
          sessionStatus: "authenticating",
        });

        try {
          const response = await fetch(
            `${SERVER_URL}/api/github/callback`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            }
          );

          const data = (await response.json()) as APIResponse<null>;

          if (response.ok && data.status_response === 201 && data.token) {
            useJWTTokenStore.getState().storeTokenInLS(data.token);
            set({
              sessionStatus: "bootstrapping",
            });
            return data;
          }

          throw new Error(
            "Invalid github callback data received: " + data.error
          );
        } catch (error) {
          console.error("GitHub callback failed:", error);
          set({
            sessionError:
              error instanceof Error
                ? error.message
                : "GitHub authentication failed.",
            sessionStatus: "anonymous",
          });
          throw error;
        }
      },

      // Get current user
      getUser: async (): Promise<APIResponse<User>> => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");

          const response = await fetch(`${SERVER_URL}/api/auth/user`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = (await response.json()) as APIResponse<User>;
          if (response.ok && data.status_response === 200 && data.data) {
            set({ user: data.data });
            return data;
          }

          throw new Error("Invalid user data received: " + data.error);
        } catch (error) {
          console.error("Error fetching user:", error);
          throw error;
        }
      },

      addEmail: async (email: string): Promise<APIResponse<null>> => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          if (!email) throw new Error("Email is required");
          const response = await fetch(
            `${SERVER_URL}/api/auth/addEmail`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email }),
            }
          );

          const data = (await response.json()) as APIResponse<null>;

          if (response.ok && data.status_response === 200) {
            const userResponse = await get().getUser();
            set({
              user: userResponse.data,
              sessionStatus: "authenticated",
            });
            return data;
          }

          throw new Error("Invalid email data received: " + data.error);
        } catch (error) {
          console.error("Error adding email:", error);
          throw error;
        }
      },
    }),
    { name: "AuthStore" }
  )
);
