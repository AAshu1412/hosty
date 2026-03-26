import {
  Activity,
  FolderKanban,
  LifeBuoy,
  Rocket,
  ScrollText,
  Settings2,
} from "lucide-react";

import type { NavItem } from "@/types/dashboard";

export function getPrimaryNavigation(projectId: string): NavItem[] {
  return [
    {
      id: "projects",
      label: "Projects",
      mobileLabel: "Projects",
      href: "/projects",
      icon: FolderKanban,
      matches: (pathname) => pathname === "/projects",
    },
    {
      id: "deployments",
      label: "Deployments",
      mobileLabel: "Deploy",
      href: `/projects/${projectId}`,
      icon: Rocket,
      matches: (pathname) => pathname.startsWith("/projects/"),
    },
    {
      id: "logs",
      label: "Logs",
      mobileLabel: "Logs",
      href: `/logs?projectId=${projectId}`,
      icon: ScrollText,
      matches: (pathname) => pathname === "/logs",
    },
    {
      id: "settings",
      label: "Settings",
      mobileLabel: "Settings",
      href: "/settings",
      icon: Settings2,
      matches: (pathname) => pathname === "/settings",
    },
  ];
}

export const utilityNavigation = [
  { label: "Support", icon: LifeBuoy },
  { label: "Status", icon: Activity },
] as const;

export function getPageTitle(pathname: string) {
  if (pathname === "/projects") {
    return "Projects";
  }

  if (pathname.startsWith("/projects/")) {
    return "Deployments";
  }

  if (pathname === "/logs") {
    return "Build Logs";
  }

  if (pathname === "/settings") {
    return "Account Settings";
  }

  return "Hosty Dashboard";
}
