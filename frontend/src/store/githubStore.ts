import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  GitHubRepo,
  GitHubRepoContent,
  GitHubRepoBranch,
} from "../utils/userType";
import type { APIResponse } from "../utils/apiResponseType";
import { useJWTTokenStore } from "./jwtTokenStore";

interface GithubStoreState {
  getUserGithubRepos: () => Promise<APIResponse<GitHubRepo[]>>;
  getUserGithubReposContent: (
    repoName: string
  ) => Promise<
    APIResponse<{ repo_content: GitHubRepoContent[]; repo_name: string }>
  >;
  getUserGithubReposContentPath: (
    repoName: string,
    path: string
  ) => Promise<
    APIResponse<{
      repo_content: GitHubRepoContent[];
      repo_name: string;
      repo_content_path: string;
    }>
  >;
  getUserGithubReposBranch: (
    repoName: string
  ) => Promise<APIResponse<GitHubRepoBranch[]>>;
}

export const useGithubStore = create<GithubStoreState>()(
  devtools(
    () => ({
      getUserGithubRepos: async (): Promise<APIResponse<GitHubRepo[]>> => {
        try {
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

          throw new Error(
            "Invalid user github repos data received: " + data.error
          );
        } catch (error) {
          console.error("Error fetching user github repos:", error);
          throw error;
        }
      },

      getUserGithubReposContent: async (
        repoName: string
      ): Promise<
        APIResponse<{ repo_content: GitHubRepoContent[]; repo_name: string }>
      > => {
        try {
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

          throw new Error("Invalid repo content received: " + data.error);
        } catch (error) {
          console.error("Error fetching user github repos content:", error);
          throw error;
        }
      },

      getUserGithubReposContentPath: async (
        repoName: string,
        path: string
      ): Promise<
        APIResponse<{
          repo_content: GitHubRepoContent[];
          repo_name: string;
          repo_content_path: string;
        }>
      > => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          const response = await fetch(
            `http://localhost:5000/api/github/repoContentPath`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ repo_name: repoName, path: path }),
            }
          );

          const data = (await response.json()) as APIResponse<{
            repo_content: GitHubRepoContent[];
            repo_name: string;
            repo_content_path: string;
          }>;

          if (response.ok && data.status_response === 200 && data.data) {
            return data;
          }

          throw new Error("Invalid repo content received: " + data.error);
        } catch (error) {
          console.error(
            "Error fetching user github repos content path:",
            error
          );
          throw error;
        }
      },
      getUserGithubReposBranch: async (
        repoName: string
      ): Promise<APIResponse<GitHubRepoBranch[]>> => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          const response = await fetch(
            `http://localhost:5000/api/github/repoBranch`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ repo_name: repoName }),
            }
          );

          const data = (await response.json()) as APIResponse<
            GitHubRepoBranch[]
          >;

          if (response.ok && data.status_response === 200 && data.data) {
            return data;
          }

          throw new Error("Invalid repo branch received: " + data.error);
        } catch (error) {
          console.error("Error fetching user github repos branch:", error);
          throw error;
        }
      },
    }),
    { name: "GithubStore" }
  )
);
