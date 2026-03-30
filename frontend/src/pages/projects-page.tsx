import { useDeferredValue, useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";

import { ProjectCard } from "@/components/projects/project-card";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import { ProjectStats } from "@/components/projects/project-stats";
import { SectionHeading } from "@/components/shared/section-heading";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "@/types/dashboard";

const environmentFilters = ["All", "Production", "Preview", "Staging"] as const;

export function ProjectsPage() {
  const user = useAuthStore((state) => state.user);
  const getUser = useAuthStore((state) => state.getUser);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const error = useAuthStore((state) => state.sessionError);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void getUser();
    }
  }, [getUser, sessionStatus]);

  const projects: ProjectSummary[] = useMemo(() => {
    if (!user || !user.repos) return [];
    
    return user.repos.map((repo: any) => {
      let status: ProjectSummary["status"] = "ready";
      if (repo.status === "failed" || repo.status === "error") status = "failed";
      else if (repo.status === "building" || repo.status === "pending") status = "building";
      else if (repo.status === "success") status = "ready";
      
      const repoNameMatch = repo.repo_url?.match(/github\.com\/[^\/]+\/([^\/.]+)/);
      const repoName = repoNameMatch ? repoNameMatch[1] : `Project-${repo.id}`;

      return {
        id: String(repo.id),
        name: repoName,
        domain: repo.hosted_site_url?.replace(/^https?:\/\//, '').replace(/\/$/, '') || "pending-deployment",
        description: `Deployed from branch ${repo.branch} by ${repo.username}`,
        framework: "React",
        iconKey: "react",
        branch: repo.branch || "main",
        lastCommitMessage: `Build #${repo.build_number}`,
        updatedAt: repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : "Just now",
        status: status,
        environment: "Production" as const,
        visits24h: 0,
        errors24h: 0,
        team: "Personal",
        region: "us-east-1"
      };
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [user]);

  const isLoading = sessionStatus === "bootstrapping" || sessionStatus === "authenticating";

  const [searchValue, setSearchValue] = useState("");
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [environmentFilter, setEnvironmentFilter] =
    useState<(typeof environmentFilters)[number]>("All");
  const deferredSearch = useDeferredValue(searchValue);

  const filteredProjects =
    projects?.filter((project) => {
      const matchesSearch =
        deferredSearch.trim().length === 0 ||
        [project.name, project.domain, project.description, project.framework]
          .join(" ")
          .toLowerCase()
          .includes(deferredSearch.toLowerCase());
      const matchesEnvironment =
        environmentFilter === "All" || project.environment === environmentFilter;

      return matchesSearch && matchesEnvironment;
    }) ?? [];

  return (
    <div className="space-y-8">
      <NewProjectDialog
        onOpenChange={setIsNewProjectDialogOpen}
        open={isNewProjectDialogOpen}
      />

      <SectionHeading
        eyebrow="Workspace Fleet"
        title="Projects"
        description="Manage your application fleet, recent deploys, and shipping health from one cohesive control surface."
        action={
          <Button onClick={() => setIsNewProjectDialogOpen(true)} type="button">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      {projects ? (
        <ProjectStats
          errors={projects.reduce((sum, project) => sum + project.errors24h, 0)}
          liveTraffic={projects.reduce((sum, project) => sum + project.visits24h, 0)}
          projectsCount={projects.length}
          readyCount={projects.filter((project) => project.status === "ready").length}
        />
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          className="w-full lg:max-w-xl"
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search projects, domains, or frameworks..."
          value={searchValue}
        />

        <div className="flex flex-wrap gap-2">
          {environmentFilters.map((filter) => (
            <button
              key={filter}
              className={cn(
                "rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all",
                environmentFilter === filter
                  ? "border-primary/15 bg-primary text-on-primary"
                  : "border-outline-variant/15 bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
              onClick={() => setEnvironmentFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="panel-shadow h-80 animate-pulse rounded-[28px] border border-outline-variant/10 bg-surface-container"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-error/20 bg-error/10 p-5 text-sm text-error">
          {error}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
