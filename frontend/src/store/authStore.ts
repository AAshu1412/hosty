import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User } from "../utils/userType";
import type { APIResponse } from "../utils/apiResponseType";
import { useJWTTokenStore } from "./jwtTokenStore";

interface AuthStoreState {
  githubCallback: (code: string) => Promise<APIResponse<null>>;
  user: User | null;
  getUser: () => Promise<APIResponse<User>>;
  addEmail: (email: string) => Promise<APIResponse<null>>;
}

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    (set, get) => ({
      githubCallback: async (code: string): Promise<APIResponse<null>> => {
        try {
          const response = await fetch(
            "http://localhost:5000/api/github/callback",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            }
          );

          const data = (await response.json()) as APIResponse<null>;

          if (response.ok && data.status_response === 201 && data.token) {
            useJWTTokenStore.getState().storeTokenInLS(data.token);
            return data;
          }

          throw new Error(
            "Invalid github callback data received: " + data.error
          );
        } catch (error) {
          console.error("GitHub callback failed:", error);
          throw error;
        }
      },

      user: null,

      // Get current user
      getUser: async (): Promise<APIResponse<User>> => {
        try {
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

          const data = (await response.json()) as APIResponse<null>;

          if (response.ok && data.status_response === 200) {
            await get().getUser();
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
