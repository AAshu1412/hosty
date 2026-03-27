import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SERVER_URL } from "../lib/constants";
import type { APIResponse } from "../utils/apiResponseType";
import { useJWTTokenStore } from "./jwtTokenStore";

interface JenkinsStoreState {
  jenkins_job_status: () => Promise<APIResponse<Record<string, unknown>>>;
  jenkins_start_build: (
    repo_url: string,
    branch: string,
    subDirectory?: string
  ) => Promise<APIResponse<{build_number: number}>>;
  jenkins_console_output: (build_number: number) => Promise<APIResponse<string>>;
  jenkins_per_build_status: (
    build_number: number
  ) => Promise<APIResponse<Record<string, unknown>>>;
}

export const useJenkinsStore = create<JenkinsStoreState>()(
  devtools(
    () => ({
      jenkins_start_build: async (
        repo_url: string,
        branch: string,
        subDirectory?: string
      ): Promise<APIResponse<{build_number: number}>> => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          const response = await fetch(
            `${SERVER_URL}/api/jenkins/startBuild`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                repo_url: repo_url,
                branch: branch,
                subDirectory: subDirectory ?? null,
              }),
            }
          );

          const data = (await response.json()) as APIResponse<{build_number: number}>;

          if (response.ok && data.status_response === 201) {
            return data;
          }

          throw new Error("Failed to start build: " + data.error);
        } catch (error) {
          console.error("Error starting build:", error);
          throw error;
        }
      },
      jenkins_console_output: async (build_number: number): Promise<APIResponse<string>> => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          const response = await fetch(
            `${SERVER_URL}/api/jenkins/consoleOutput`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ build_number: build_number }),
            }
          );
          const data = (await response.json()) as APIResponse<string>;
          if (response.ok && data.status_response === 200 && data.data) {
            return data;
          }
          throw new Error("Invalid console output received: " + data.error);
        } catch (error) {
          console.error("Error getting console output:", error);
          throw error;
        }
      },

      jenkins_job_status: async (): Promise<
        APIResponse<Record<string, unknown>>
      > => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          const response = await fetch(
            `${SERVER_URL}/api/jenkins/jobStatus`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = (await response.json()) as APIResponse<
            Record<string, unknown>
          >;
          if (response.ok && data.status_response === 200 && data.data) {
            return data;
          }
          throw new Error("Invalid job status received: " + data.error);
        } catch (error) {
          console.error("Error getting job status:", error);
          throw error;
        }
      },

      jenkins_per_build_status: async (
        build_number: number
      ): Promise<APIResponse<Record<string, unknown>>> => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          const response = await fetch(
            `${SERVER_URL}/api/jenkins/perBuildStatus`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ build_number: build_number }),
            }
          );
          const data = (await response.json()) as APIResponse<
            Record<string, unknown>
          >;
          if (response.ok && data.status_response === 200 && data.data) {
            return data;
          }
          throw new Error("Invalid per build status received: " + data.error);
        } catch (error) {
          console.error("Error getting per build status:", error);
          throw error;
        }
      },
    }),
    { name: "JenkinsStore" }
  )
);
