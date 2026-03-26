import { Activity, FolderKanban, Rocket, TriangleAlert } from "lucide-react";

import { Panel } from "@/components/shared/panel";

interface ProjectStatsProps {
  projectsCount: number;
  readyCount: number;
  liveTraffic: number;
  errors: number;
}

export function ProjectStats({
  projectsCount,
  readyCount,
  liveTraffic,
  errors,
}: ProjectStatsProps) {
  const items = [
    {
      label: "Projects",
      value: projectsCount.toString(),
      helper: "Active app surfaces",
      icon: FolderKanban,
    },
    {
      label: "Ready",
      value: readyCount.toString(),
      helper: "Healthy production states",
      icon: Rocket,
    },
    {
      label: "Traffic",
      value: liveTraffic.toLocaleString(),
      helper: "Requests in the last 24h",
      icon: Activity,
    },
    {
      label: "Errors",
      value: errors.toString(),
      helper: "Issues flagged across services",
      icon: TriangleAlert,
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {items.map(({ label, value, helper, icon: Icon }) => (
        <Panel key={label} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                {label}
              </p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.05em] text-on-surface">
                {value}
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">{helper}</p>
            </div>
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high p-3 text-tertiary-container">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
