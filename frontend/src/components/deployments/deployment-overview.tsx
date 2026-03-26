import { ArrowUpRight, Clock3, Globe2, Layers3, Radar, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import { InfoRow } from "@/components/shared/info-row";
import { Panel } from "@/components/shared/panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { DeploymentRecord, ProjectSummary } from "@/types/dashboard";

interface DeploymentOverviewProps {
  project: ProjectSummary;
  deployment: DeploymentRecord;
}

export function DeploymentOverview({
  project,
  deployment,
}: DeploymentOverviewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
      <Panel className="overflow-hidden">
        <div className="relative flex min-h-[22rem] flex-col justify-between overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(77,142,255,0.22),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
          <div className="absolute inset-x-8 bottom-8 top-24 rounded-[32px] border border-outline-variant/10 bg-surface-container-low/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="grid h-full grid-cols-[1.4fr_0.8fr] gap-4 p-5">
              <div className="rounded-[26px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
              <div className="grid gap-4">
                <div className="rounded-[24px] border border-outline-variant/10 bg-surface-container-high/80" />
                <div className="rounded-[24px] border border-outline-variant/10 bg-surface-container-highest/60" />
              </div>
            </div>
          </div>

          <div className="relative space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={deployment.status} />
              <span className="rounded-full border border-outline-variant/15 bg-surface-container-lowest/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                {deployment.environment}
              </span>
            </div>

            <div className="max-w-2xl space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant/70">
                Current Deployment
              </p>
              <h2 className="text-balance text-3xl font-bold tracking-[-0.05em] text-on-surface sm:text-4xl">
                {project.name}
              </h2>
              <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
                {deployment.changeSummary}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={`https://${deployment.previewUrl}`} rel="noreferrer" target="_blank">
                  Visit deployment
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="secondary">
                <Link
                  to={`/logs?projectId=${project.id}&deploymentId=${deployment.id}`}
                >
                  Open logs
                </Link>
              </Button>
              <Button variant="ghost">
                <RefreshCw className="h-4 w-4" />
                Redeploy
              </Button>
            </div>
          </div>

          <div className="relative mt-8 flex flex-wrap items-center gap-4">
            <div className="glass-panel rounded-3xl border border-outline-variant/15 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/70">
                Preview URL
              </p>
              <p className="mt-2 font-mono text-sm text-primary">{deployment.previewUrl}</p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
              Deployment Info
            </p>
            <h3 className="text-xl font-bold tracking-[-0.04em] text-on-surface">
              Ship details
            </h3>
          </div>

          <div className="space-y-5">
            <InfoRow icon={Layers3} label="Framework" value={project.framework} />
            <InfoRow icon={Globe2} label="Region" value={deployment.region} />
            <InfoRow icon={Radar} label="Runtime" value={deployment.runtime} />
            <InfoRow icon={Clock3} label="Duration" value={deployment.duration} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
