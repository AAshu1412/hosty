import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { JWT_TOKEN_KEY } from "../lib/constants";
// import type { User, APIResponse } from "../types/User"; // Your User type
import type { GitHubUser, User } from "../utils/userType";
import type { APIResponse } from "../utils/apiResponseType";

interface ApiStoreState {
  jwtToken: string | null;
  storeTokenInLS: (token?: string) => void;
  isAuthenticated: () => boolean;
  clearToken: () => void;
  githubCallback: (code: string) => Promise<APIResponse>;
  user: User | null;
  getUser: () => Promise<User>;
  
}

export const useApiStore = create<ApiStoreState>()(
  devtools(
    (set, get) => ({
      jwtToken: localStorage.getItem(JWT_TOKEN_KEY) || null,

      // Store token in localStorage + update state
      storeTokenInLS: (token?: string) => {
        if (token) {
          localStorage.setItem(JWT_TOKEN_KEY, token);
          set({ jwtToken: token });
        }
      },

      // Clear token (logout)
      clearToken: () => {
        localStorage.removeItem(JWT_TOKEN_KEY);
        set({ jwtToken: null });
      },

      // GitHub OAuth callback
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
          
          const data = await response.json() as APIResponse;
          
          if (response.ok && data.status_response === 201 && data.token) {
            get().storeTokenInLS(data.token);
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
        const token = get().jwtToken;
        if (!token) throw new Error("No token found");

        const response = await fetch("http://localhost:5000/api/github/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as APIResponse;
        if (response.ok && data.status_response === 200 && typeof data.data === GitHubUser) {
        set({ user: data.data });
        }
        return data.data;
      },

      // Auth check
      isAuthenticated: () => {
        return !!localStorage.getItem(JWT_TOKEN_KEY);
      },
    }),
    { name: "ApiStore" } // DevTools name
  )
);
