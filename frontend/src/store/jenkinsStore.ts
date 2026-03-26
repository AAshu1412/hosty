import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { APIResponse } from "../utils/apiResponseType";
import { useJWTTokenStore } from "./jwtTokenStore";

interface JenkinsStoreState {
  jenkins_start_build: (
    repo_url: string,
    branch: string
  ) => Promise<APIResponse<{build_number: number}>>;
  jenkins_console_output: (build_number: number) => Promise<APIResponse<string>>;
  jenkins_job_status: () => Promise<APIResponse<any>>;
  jenkins_per_build_status: (build_number: number) => Promise<APIResponse<any>>;
}

export const useJenkinsStore = create<JenkinsStoreState>()(
  devtools(
    () => ({
      jenkins_start_build: async (
        repo_url: string,
        branch: string
      ): Promise<APIResponse<{build_number: number}>> => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          const response = await fetch(
            `http://localhost:5000/api/jenkins/startBuild`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ repo_url: repo_url, branch: branch }),
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
            `http://localhost:5000/api/jenkins/consoleOutput`,
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

      jenkins_job_status: async (): Promise<APIResponse<any>> => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          const response = await fetch(
            `http://localhost:5000/api/jenkins/jobStatus`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = (await response.json()) as APIResponse<any>;
          if (response.ok && data.status_response === 200 && data.data) {
            return data;
          }
          throw new Error("Invalid job status received: " + data.error);
        } catch (error) {
          console.error("Error getting job status:", error);
          throw error;
        }
      },

      jenkins_per_build_status: async (build_number: number): Promise<APIResponse<any>> => {
        try {
          const token = useJWTTokenStore.getState().jwtToken;
          if (!token) throw new Error("No token found");
          const response = await fetch(
            `http://localhost:5000/api/jenkins/perBuildStatus`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ build_number: build_number }),
            }
          );
          const data = (await response.json()) as APIResponse<any>;
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
