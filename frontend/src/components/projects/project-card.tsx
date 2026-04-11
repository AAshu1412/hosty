import { ArrowRight, GitBranch } from "lucide-react";
import { Link } from "react-router-dom";

import { Panel } from "@/components/shared/panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProjectGlyph } from "@/components/projects/project-glyph";
import { Button } from "@/components/ui/button";
import type { ProjectSummary } from "@/types/dashboard";

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Panel className="group flex h-full flex-col justify-between p-6 transition-transform duration-200 hover:-translate-y-1">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container-lowest text-primary">
              <ProjectGlyph iconKey={project.iconKey} />
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-bold tracking-[-0.04em] text-on-surface">
                  {project.name}
                </h3>
                <a href={`http://${project.domain}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-on-surface-variant">
                  {project.domain}
                </a>
              </div>
              <StatusBadge status={project.status} />
            </div>
          </div>
          <Button asChild size="icon" variant="ghost">
            <Link 
              to={`/projects/${project.id}`} 
              state={{ buildNumber: project.latestBuildNumber, repoFullName: project.repoFullName }}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="text-sm leading-6 text-on-surface-variant">
          {project.description}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
              <GitBranch className="h-3.5 w-3.5" />
              Branch
            </div>
            <p className="mt-2 text-sm font-medium text-on-surface">{project.branch}</p>
          </div>
          {/* <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
              <Globe2 className="h-3.5 w-3.5" />
              Region
            </div>
            <p className="mt-2 text-sm font-medium text-on-surface">{project.region}</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
              <Activity className="h-3.5 w-3.5" />
              Visits 24h
            </div>
            <p className="mt-2 text-sm font-medium text-on-surface">
              {project.visits24h.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
              <TriangleAlert className="h-3.5 w-3.5" />
              Errors 24h
            </div>
            <p className="mt-2 text-sm font-medium text-on-surface">{project.errors24h}</p>
          </div> */}
        </div>
      </div>

      <div className="mt-6 border-t border-outline-variant/10 pt-4">
        <p className="text-xs text-on-surface-variant">{project.lastCommitMessage}</p>
        <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-on-surface-variant/70">
          <span>{project.environment}</span>
          <span>{project.updatedAt}</span>
        </div>
      </div>
    </Panel>
  );
}
