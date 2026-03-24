import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { JWT_TOKEN_KEY } from "../lib/constants";
// import type { User, APIResponse } from "../types/User"; // Your User type
import type { GitHubRepo, User, GitHubRepoContent } from "../utils/userType";
import type { APIResponse } from "../utils/apiResponseType";
import { useJWTTokenStore } from "./jwtTokenStore";

interface GithubStoreState {
  getUserGithubRepos: () => Promise<APIResponse<GitHubRepo[]>>;
  getUserGithubReposContent: (repoName: string) => Promise<APIResponse<{ repo_content: GitHubRepoContent[]; repo_name: string }>>;
}

export const useGithubStore = create<GithubStoreState>()(
  devtools(
    (set, get) => ({
      getUserGithubRepos: async (): Promise<APIResponse<GitHubRepo[]>> => {
        const token = useJWTTokenStore.getState().jwtToken;
        if (!token) throw new Error("No token found");
        const response = await fetch(
          "http://localhost:5000/api/github/userRepos",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = (await response.json()) as APIResponse<GitHubRepo[]>;

        if (response.ok && data.status_response === 200 && data.data) {
          return data;
        }

        throw new Error("Invalid user github repos data received");
      },

      getUserGithubReposContent: async (
        repoName: string
      ): Promise<
        APIResponse<{ repo_content: GitHubRepoContent[]; repo_name: string }>
      > => {
        const token = useJWTTokenStore.getState().jwtToken;
        if (!token) throw new Error("No token found");
        const response = await fetch(
          `http://localhost:5000/api/github/repoContent`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ repo_name: repoName }),
          }
        );

        const data = (await response.json()) as APIResponse<{
          repo_content: GitHubRepoContent[];
          repo_name: string;
        }>;

        if (response.ok && data.status_response === 200 && data.data) {
          return data;
        }

        throw new Error("Invalid repo content received");
      },

      
    }),
    { name: "GithubStore" }
  )
);
