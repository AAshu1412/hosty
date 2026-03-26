import { ArrowRight, GitBranch, GitCommitHorizontal, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { Panel } from "@/components/shared/panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { DeploymentRecord } from "@/types/dashboard";

interface DeploymentTimelineProps {
  projectId: string;
  deployments: DeploymentRecord[];
}

export function DeploymentTimeline({
  projectId,
  deployments,
}: DeploymentTimelineProps) {
  return (
    <Panel className="p-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
              Recent Activity
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">
              Recent deployments
            </h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Mock history now, real deployment stream later.
          </p>
        </div>

        <div className="space-y-3">
          {deployments.map((deployment) => (
            <div
              key={deployment.id}
              className="rounded-[26px] border border-outline-variant/10 bg-surface-container-low p-4"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={deployment.status} />
                    <span className="text-xs text-on-surface-variant">
                      Build #{deployment.buildNumber}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {deployment.createdAt}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {deployment.commitMessage}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-on-surface-variant">
                      <span className="inline-flex items-center gap-2">
                        <GitBranch className="h-3.5 w-3.5" />
                        {deployment.branch}
                      </span>
                      <span className="inline-flex items-center gap-2 font-mono">
                        <GitCommitHorizontal className="h-3.5 w-3.5" />
                        {deployment.commitSha}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="h-3.5 w-3.5" />
                        {deployment.authorName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      to={`/logs?projectId=${projectId}&deploymentId=${deployment.id}`}
                    >
                      View logs
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a href={`https://${deployment.previewUrl}`} rel="noreferrer" target="_blank">
                      Open preview
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
