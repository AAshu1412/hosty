import { BarChart3, Clock3, Layers3, TimerReset } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { DeploymentOverview } from "@/components/deployments/deployment-overview";
import { DeploymentTimeline } from "@/components/deployments/deployment-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { Panel } from "@/components/shared/panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-dashboard-data";

export function ProjectDetailsPage() {
  const { projectId = "" } = useParams();
  const { data, isLoading, error } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-[28px] bg-surface-container" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
          <div className="h-[28rem] animate-pulse rounded-[28px] bg-surface-container" />
          <div className="h-[28rem] animate-pulse rounded-[28px] bg-surface-container" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        description={error ?? "The selected project is not present in the mock dataset yet."}
        title="Project details unavailable"
      />
    );
  }

  const { project, currentDeployment, recentDeployments } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
          <Link className="hover:text-on-surface" to="/projects">
            Projects
          </Link>
          <span>/</span>
          <span className="font-medium text-on-surface">{project.name}</span>
          <StatusBadge className="ml-1" status={currentDeployment.status} />
        </div>

        <SectionHeading
          eyebrow="Main View"
          title={project.name}
          description={project.description}
          action={
            <Button asChild variant="secondary">
              <Link
                to={`/logs?projectId=${project.id}&deploymentId=${currentDeployment.id}`}
              >
                View build logs
              </Link>
            </Button>
          }
        />
      </div>

      <DeploymentOverview deployment={currentDeployment} project={project} />

      <div className="grid gap-4 xl:grid-cols-4">
        {[
          {
            icon: Layers3,
            label: "Requests 24h",
            value: currentDeployment.metrics.requests24h.toLocaleString(),
          },
          {
            icon: BarChart3,
            label: "Avg latency",
            value: `${currentDeployment.metrics.avgLatencyMs}ms`,
          },
          {
            icon: Clock3,
            label: "Bundle size",
            value: `${currentDeployment.metrics.bundleSizeKb}kb`,
          },
          {
            icon: TimerReset,
            label: "Build number",
            value: `#${currentDeployment.buildNumber}`,
          },
        ].map(({ icon: Icon, label, value }) => (
          <Panel key={label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                  {label}
                </p>
                <p className="mt-3 text-2xl font-bold tracking-[-0.04em] text-on-surface">
                  {value}
                </p>
              </div>
              <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high p-3 text-tertiary-container">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <DeploymentTimeline deployments={recentDeployments} projectId={project.id} />
    </div>
  );
}
