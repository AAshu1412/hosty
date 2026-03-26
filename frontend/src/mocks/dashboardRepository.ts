import {
  defaultProjectId,
  deploymentsByProject,
  logGroups,
  projects,
  settingsData,
} from "@/mocks/dashboardData";
import type { LogGroup, ProjectDetailsData, ProjectSummary, SettingsData } from "@/types/dashboard";

const delay = (ms = 120) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const clone = <T,>(value: T): T => structuredClone(value);

export function getDefaultProjectId() {
  return defaultProjectId;
}

export async function getProjects(): Promise<ProjectSummary[]> {
  await delay();
  return clone(projects);
}

export async function getProjectById(
  projectId: string
): Promise<ProjectDetailsData | null> {
  await delay();

  const project = projects.find((entry) => entry.id === projectId);
  const recentDeployments = deploymentsByProject[projectId];

  if (!project || !recentDeployments?.length) {
    return null;
  }

  return clone({
    project,
    currentDeployment: recentDeployments[0],
    recentDeployments,
  });
}

export async function getProjectLogs(projectId = defaultProjectId): Promise<LogGroup> {
  await delay();

  return clone(logGroups[projectId] ?? logGroups[defaultProjectId]);
}

export async function getSettingsProfile(): Promise<SettingsData> {
  await delay();
  return clone(settingsData);
}
