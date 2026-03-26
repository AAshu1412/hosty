import type { LucideIcon } from "lucide-react";

export type AppRouteId = "projects" | "deployments" | "logs" | "settings";
export type ProjectStatus = "ready" | "building" | "warning" | "failed";
export type DeploymentStatus =
  | "ready"
  | "building"
  | "queued"
  | "warning"
  | "failed";
export type LogLevel = "info" | "warn" | "error" | "success";
export type ProjectEnvironment = "Production" | "Preview" | "Staging";
export type TeamRole = "Owner" | "Member";
export type NotificationIconKey = "bolt" | "warning" | "mail";

export interface NavItem {
  id: AppRouteId;
  label: string;
  mobileLabel: string;
  href: string;
  icon: LucideIcon;
  matches: (pathname: string) => boolean;
}

export interface ProjectSummary {
  id: string;
  name: string;
  domain: string;
  description: string;
  framework: string;
  iconKey: string;
  branch: string;
  lastCommitMessage: string;
  updatedAt: string;
  status: ProjectStatus;
  environment: ProjectEnvironment;
  visits24h: number;
  errors24h: number;
  team: string;
  region: string;
}

export interface DeploymentRecord {
  id: string;
  projectId: string;
  environment: ProjectEnvironment;
  status: DeploymentStatus;
  duration: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  previewUrl: string;
  region: string;
  runtime: string;
  source: string;
  buildNumber: number;
  changeSummary: string;
  metrics: {
    requests24h: number;
    avgLatencyMs: number;
    bundleSizeKb: number;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  detail?: string;
  code?: string;
}

export interface LogGroup {
  id: string;
  projectId: string;
  deploymentId: string;
  deploymentLabel: string;
  environment: ProjectEnvironment;
  live: boolean;
  status: DeploymentStatus;
  duration: string;
  region: string;
  runtime: string;
  startedAt: string;
  branch: string;
  commitSha: string;
  entries: LogEntry[];
}

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  roleLabel: string;
  avatar: string;
  plan: string;
  location: string;
  timezone: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  initials: string;
  members: number;
  role: TeamRole;
  plan: string;
  projects: number;
  accent: string;
  lastActivity: string;
}

export interface SecuritySession {
  id: string;
  label: string;
  location: string;
  device: string;
  lastSeen: string;
  current: boolean;
}

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: NotificationIconKey;
}

export interface SettingsData {
  profile: UserProfile;
  teams: TeamSummary[];
  notifications: NotificationPreference[];
  sessions: SecuritySession[];
  dangerZone: {
    note: string;
    logoutLabel: string;
    deleteLabel: string;
  };
}

export interface ProjectDetailsData {
  project: ProjectSummary;
  currentDeployment: DeploymentRecord;
  recentDeployments: DeploymentRecord[];
}
