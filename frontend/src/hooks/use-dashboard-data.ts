import {
  getProjectById,
  getProjectLogs,
  getProjects,
  getSettingsProfile,
} from "@/mocks/dashboardRepository";
import { useMockResource } from "@/hooks/use-mock-resource";

export function useProjects() {
  return useMockResource("projects", () => getProjects());
}

export function useProject(projectId: string) {
  return useMockResource(`project:${projectId}`, () => getProjectById(projectId));
}

export function useProjectLogs(projectId?: string) {
  return useMockResource(`logs:${projectId ?? "default"}`, () =>
    getProjectLogs(projectId)
  );
}

export function useSettingsData() {
  return useMockResource("settings", () => getSettingsProfile());
}
