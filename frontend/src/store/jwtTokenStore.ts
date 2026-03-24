import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { JWT_TOKEN_KEY } from "../lib/constants";

interface JWTTokenStoreState {
  jwtToken: string | null;
  storeTokenInLS: (token?: string) => void;
  isAuthenticated: () => boolean;
  clearToken: () => void;
}

export const useJWTTokenStore = create<JWTTokenStoreState>()(
  devtools(
    (set, get) => ({
      jwtToken: localStorage.getItem(JWT_TOKEN_KEY) || null,

      storeTokenInLS: (token?: string) => {
        if (token) {
          localStorage.setItem(JWT_TOKEN_KEY, token);
          set({ jwtToken: token });
        }
      },

      clearToken: () => {
        localStorage.removeItem(JWT_TOKEN_KEY);
        set({ jwtToken: null });
      },

      isAuthenticated: () => {
        return !!localStorage.getItem(JWT_TOKEN_KEY);
      },
    }),
    { name: "JWTTokenStore" }
  )
);
