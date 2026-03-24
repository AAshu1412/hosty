import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { JWT_TOKEN_KEY } from "../lib/constants";
// import type { User, APIResponse } from "../types/User"; // Your User type
import type { User } from "../utils/userType";
import type { APIResponse } from "../utils/apiResponseType";
import { useJWTTokenStore } from "./jwtTokenStore";

interface AuthStoreState {
  githubCallback: (code: string) => Promise<APIResponse>;
  user: User | null;
  getUser: () => Promise<User>;
  addEmail: (email: string) => Promise<APIResponse>;
}

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    (set, get) => ({
      githubCallback: async (code: string): Promise<APIResponse> => {
        try {
          const response = await fetch(
            "http://localhost:5000/api/github/callback",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            }
          );

          const data = (await response.json()) as APIResponse;

          if (response.ok && data.status_response === 201 && data.token) {
            useJWTTokenStore.getState().storeTokenInLS(data.token);
          }

          return data;
        } catch (error) {
          console.error("GitHub callback failed:", error);
          throw error;
        }
      },
      
      user: null,

      // Get current user
      getUser: async (): Promise<User> => {
        const token = useJWTTokenStore.getState().jwtToken;
        if (!token) throw new Error("No token found");

        const response = await fetch("http://localhost:5000/api/auth/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as APIResponse;
        if (response.ok && data.status_response === 200 && data.data) {
          set({ user: data.data });
          return data.data;
        }

        throw new Error("Invalid user data received");
      },

      addEmail: async (email: string): Promise<APIResponse> => {
        const token = useJWTTokenStore.getState().jwtToken;
        if (!token) throw new Error("No token found");
        if (!email) throw new Error("Email is required");
        const response = await fetch(
          "http://localhost:5000/api/auth/addEmail",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        const data = (await response.json()) as APIResponse;

        if (response.ok && data.status_response === 200) {
          return data;
        }

        throw new Error("Invalid email data received");
      },
    }),
    { name: "AuthStore" }
  )
);
