import { useDeferredValue, useState, useEffect, useMemo } from "react";
import { Clock, GitBranch, Hash, Terminal, ArrowRight, Activity } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Panel } from "@/components/shared/panel";
import { SearchInput } from "@/components/shared/search-input";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export function LogsPage() {
  const [searchParams] = useSearchParams();
  const projectIdMap = searchParams.get("projectId") ?? null;
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const getUser = useAuthStore((state) => state.getUser);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);

  // Auto-refresh the user object in the background if legally authenticated
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void getUser();
    }
  }, [getUser, sessionStatus]);

  const builds = useMemo(() => {
    if (!user || !user.repos) return [];
    
    let allBuilds = user.repos.flatMap((repo: any) => {
      const buildsArray = repo.number_of_builds || [];
      
      return buildsArray.map((b: any) => {
         const repoNameMatch = repo.repo_url?.match(/github\.com\/[^\/]+\/([^\/.]+)/);
         const repoName = repoNameMatch ? repoNameMatch[1] : `Project-${repo.id}`;

         // Note: For historical builds without specific statuses, we assume success, 
         // unless it is the currently tracked build number that is actively reporting.
         let status = "ready";
         if (b.build === repo.build_number) {
            status = repo.status === "success" ? "ready" : (repo.status === "failed" || repo.status === "error" ? "failed" : "building");
         }

         return {
           repoId: repo.id,
           repoName: repoName,
           repoFullName: repo.repo_url,
           branch: repo.branch,
           buildNumber: b.build,
           createdAt: b.created_at,
           status: status,
           domain: repo.hosted_site_url || "Unknown Domain"
         };
      });
    });

    if (projectIdMap) {
      allBuilds = allBuilds.filter(b => String(b.repoId) === projectIdMap);
    }
    
    if (deferredQuery) {
       allBuilds = allBuilds.filter(b => 
          b.repoName.toLowerCase().includes(deferredQuery.toLowerCase()) || 
          String(b.buildNumber).includes(deferredQuery) ||
          b.branch.toLowerCase().includes(deferredQuery.toLowerCase())
       );
    }

    // Sort by most recent execution
    return allBuilds.sort((a, b) => b.createdAt - a.createdAt);
  }, [user, projectIdMap, deferredQuery]);

  const isLoading = sessionStatus === 'bootstrapping' || sessionStatus === 'authenticating';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeading
        eyebrow="Fleet History"
        title="Deployments & Logs"
        description="View past and active builds across your workspace. Click any session to jump directly to the live output inspection terminal."
      />

      <Panel className="overflow-hidden border border-outline-variant/15 shadow-sm">
        <div className="border-b border-outline-variant/10 bg-surface-container-low/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              className="w-full sm:max-w-md hover:bg-surface-container focus-within:bg-surface-container transition-colors"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by project name, branch, or trace ID..."
              value={query}
            />
          </div>
        </div>

        <div className="divide-y divide-outline-variant/10 bg-surface-container-lowest/50">
          {isLoading ? (
             <div className="p-8 space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-[20px] animate-pulse bg-surface-container/60 shadow-inner" />)}
             </div>
          ) : builds.length === 0 ? (
             <div className="p-16 text-center text-on-surface-variant flex flex-col items-center justify-center">
                <Activity className="w-12 h-12 mb-5 text-outline-variant opacity-60" />
                <h3 className="text-lg font-bold text-on-surface">No deployment history</h3>
                <p className="mt-2 text-sm max-w-[300px]">Active and historical builds will be populated here as they are deployed via Jenkins pipelines.</p>
             </div>
          ) : (
             builds.map((build, idx) => (
                <div 
                   key={`${build.repoId}-${build.buildNumber}-${idx}`} 
                   className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 transition-all duration-300 hover:bg-surface-container-low gap-5"
                >
                   <div className="flex items-center gap-5">
                       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container shadow-sm group-hover:scale-105 group-hover:-rotate-3 transition-transform text-tertiary">
                          <Terminal className="h-[22px] w-[22px]" />
                       </div>
                       <div>
                          <div className="flex items-center gap-3">
                             <h4 className="font-bold text-on-surface tracking-tight text-lg">{build.repoName}</h4>
                             <StatusBadge status={build.status as any} />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant font-mono">
                             <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-on-surface-variant/70" /> {build.buildNumber}</span>
                             <span className="text-outline-variant/50">•</span>
                             <span className="flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5 text-on-surface-variant/70" /> {build.branch}</span>
                             <span className="text-outline-variant/50">•</span>
                             <span className="flex items-center gap-1.5 bg-surface-container-low px-2 py-0.5 rounded-md"><Clock className="w-3 h-3" /> {new Date(build.createdAt).toLocaleString()}</span>
                          </div>
                       </div>
                   </div>

                   <Button 
                      variant="secondary" 
                      className="shrink-0 shadow-sm transition-all hover:bg-on-surface hover:text-surface group-hover:px-5"
                      onClick={() => navigate(`/projects/${build.repoId}`, { 
                          state: { buildNumber: build.buildNumber, repoFullName: build.repoFullName } 
                      })}
                   >
                     Inspect Output <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
                   </Button>
                </div>
             ))
          )}
        </div>
      </Panel>
    </div>
  );
}
