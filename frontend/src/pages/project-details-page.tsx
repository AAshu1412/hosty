import { useEffect, useState, useRef } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, CircleDashed, Globe2, Terminal, XCircle, History } from "lucide-react";

import { Panel } from "@/components/shared/panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useJenkinsStore } from "@/store/jenkinsStore";
import { cn } from "@/lib/utils";

export function ProjectDetailsPage() {
  const { projectId = "" } = useParams();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const getUser = useAuthStore((state) => state.getUser);
  
  const jenkins_console_output = useJenkinsStore((state) => state.jenkins_console_output);
  const jenkins_per_build_status = useJenkinsStore((state) => state.jenkins_per_build_status);

  // Router state passed from new-project-dialog or project-card
  const routeState = location.state as { buildNumber?: number; repoFullName?: string } | null;

  // Fallback to searching user deployed repos if we navigate directly to the page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deployedRepo = user?.repos?.find((r: any) => String(r.id) === projectId) as any;
  const displayRepoName = routeState?.repoFullName || deployedRepo?.repo_url || `Project ${projectId}`;

  const defaultBuildNumber = routeState?.buildNumber || deployedRepo?.build_number;
  const [activeBuildNumber, setActiveBuildNumber] = useState<number | undefined>(defaultBuildNumber);

  // Sync active build if user state hydrates late
  useEffect(() => {
     if (!activeBuildNumber && deployedRepo?.build_number) {
        setActiveBuildNumber(deployedRepo.build_number);
     }
  }, [activeBuildNumber, deployedRepo]);

  const [consoleLogs, setConsoleLogs] = useState<string>("");
  const [buildStatus, setBuildStatus] = useState<string | null>(activeBuildNumber ? "IN_PROGRESS" : null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Keep terminal autoscrolled
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  // Main polling loop for active builds
  useEffect(() => {
    if (!activeBuildNumber) return;

    let isActive = true;
    let pollInterval: ReturnType<typeof setInterval>;

    // Reset view context when build number changes
    setConsoleLogs("");
    setBuildStatus("IN_PROGRESS");

    const checkStatus = async () => {
      try {
        // 1. Fetch console output stream
        const logRes = await jenkins_console_output(activeBuildNumber);
        if (isActive && logRes.data) {
          setConsoleLogs(logRes.data);
        }

        // 2. Fetch active build status
        const statusRes = await jenkins_per_build_status(activeBuildNumber);
        const result = statusRes.data?.result as string | null;

        if (isActive) {
          if (result === "SUCCESS" || result === "FAILURE") {
            setBuildStatus(result);
            clearInterval(pollInterval);
            
            // If perfectly done, refresh authenticated user data payload
            if (result === "SUCCESS") {
               void getUser();
            }
          } else {
            setBuildStatus("IN_PROGRESS");
          }
        }
      } catch (err) {
        console.error("Error polling Jenkins:", err);
      }
    };

    void checkStatus();

    pollInterval = setInterval(() => {
      void checkStatus();
    }, 3000); 

    return () => {
      isActive = false;
      clearInterval(pollInterval);
    };
  }, [activeBuildNumber, jenkins_console_output, jenkins_per_build_status, getUser]);

  // Derived status badge
  let derivedBadgeStatus: "ready" | "building" | "failed" | "error" | "paused" = "ready";
  if (buildStatus === "IN_PROGRESS") derivedBadgeStatus = "building";
  else if (buildStatus === "SUCCESS") derivedBadgeStatus = "ready";
  else if (buildStatus === "FAILURE") derivedBadgeStatus = "failed";
  else if (deployedRepo?.status === "SUCCESS") derivedBadgeStatus = "ready";
  else if (deployedRepo?.status === "IN_PROGRESS") derivedBadgeStatus = "building";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
          <Link className="hover:text-on-surface transition-colors" to="/projects">
            Projects
          </Link>
          <span>/</span>
          <span className="font-medium text-on-surface">{displayRepoName}</span>
          <StatusBadge className="ml-1" status={derivedBadgeStatus} />
        </div>

        <SectionHeading
          eyebrow="Main View"
          title={displayRepoName}
          description="Live deployment tracking and project details. Easily traverse past outputs and environments."
        />
      </div>

      <Panel className="overflow-hidden border border-outline-variant/15 shadow-sm">
        <div className="flex flex-col md:flex-row min-h-[600px] h-[70vh] md:max-h-[85vh]">
            {/* Left side details */}
            <div className="p-0 md:w-[35%] lg:w-[30%] border-b md:border-b-0 md:border-r border-outline-variant/10 bg-surface-container-lowest flex flex-col text-sm">
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-on-surface">Build Execution</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">Real-time status tracking.</p>
                </div>

                <div className="space-y-4 text-sm text-on-surface-variant">
                  <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                      <span>Status</span>
                      <span className="font-medium text-on-surface flex items-center gap-2">
                      {buildStatus === "IN_PROGRESS" && <><CircleDashed className="w-4 h-4 animate-spin text-tertiary" /> Building</>}
                      {buildStatus === "SUCCESS" && <><CheckCircle2 className="w-4 h-4 text-primary" /> Success</>}
                      {buildStatus === "FAILURE" && <><XCircle className="w-4 h-4 text-error" /> Failed</>}
                      {!buildStatus && deployedRepo?.status && <>{deployedRepo.status}</>}
                      {!buildStatus && !deployedRepo?.status && "Unknown"}
                      </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                      <span>Instance Tracker</span>
                      <span className="font-mono text-on-surface">#{activeBuildNumber || "---"}</span>
                  </div>
                  
                  {/* Dynamically display deployed URL once it successfully populates! */}
                  {deployedRepo?.hosted_site_url && (
                      <div className="flex flex-col pt-4 pb-2 animate-in fade-in slide-in-from-bottom-2">
                          <span className="mb-3 font-semibold text-primary/80 uppercase tracking-widest text-[10px]">Active Deployment</span>
                          <Button asChild className="w-full shadow-md bg-gradient-to-tr from-primary to-primary/80 hover:scale-[1.02] transition-transform">
                          <a href={deployedRepo.hosted_site_url} target="_blank" rel="noreferrer">
                              <Globe2 className="w-4 h-4 mr-2" /> Navigate to Site
                          </a>
                          </Button>
                      </div>
                  )}
                </div>
              </div>

              {/* Previous Builds List */}
              <div className="flex-1 overflow-y-auto bg-surface-container-low/30 border-t border-outline-variant/5">
                 <div className="sticky top-0 bg-surface-container-lowest/90 backdrop-blur-md px-6 md:px-8 py-3 z-10 border-b border-outline-variant/5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70 flex items-center gap-2">
                      <History className="w-3.5 h-3.5" /> Build History
                    </h4>
                 </div>
                 <div className="p-4 md:p-6 space-y-2">
                    {(() => {
                       const buildsList = [...(deployedRepo?.number_of_builds || [])];
                       if (deployedRepo?.build_number && !buildsList.find((b: any) => b.build === deployedRepo.build_number)) {
                          buildsList.push({
                             build: deployedRepo.build_number,
                             created_at: deployedRepo.created_at || deployedRepo.updated_at || Date.now()
                          });
                       }
                       
                       if (!buildsList.length) {
                          return (
                            <div className="text-center py-4 text-xs text-on-surface-variant italic opacity-60">
                              No historical builds located
                            </div>
                          );
                       }

                       return buildsList.slice().reverse().map((b: any) => (
                           <button
                              key={b.build}
                              onClick={() => setActiveBuildNumber(b.build)}
                              className={cn(
                                "group w-full text-left flex items-center justify-between p-3.5 rounded-xl transition-all border text-sm",
                                activeBuildNumber === b.build
                                  ? "bg-primary/10 border-primary/30 text-primary font-medium shadow-sm ring-1 ring-primary/20"
                                  : "bg-surface-container-lowest border-outline-variant/10 text-on-surface hover:bg-surface-container-low hover:border-outline-variant/20 hover:shadow-sm"
                              )}
                           >
                             <div className="flex items-center gap-3">
                               <Terminal className={cn("w-4 h-4 transition-colors", activeBuildNumber === b.build ? "text-primary" : "text-on-surface-variant/70 group-hover:text-on-surface-variant")} />
                               <span>Build #{b.build}</span>
                             </div>
                             <span className={cn("text-[10px] font-mono", activeBuildNumber === b.build ? "text-primary/70" : "text-on-surface-variant/60")}>
                               {new Date(b.created_at).toLocaleDateString()}
                             </span>
                           </button>
                        ));
                    })()}
                 </div>
              </div>
            </div>

            {/* Right side live console terminal */}
            <div className="p-0 md:w-[65%] lg:w-[70%] bg-[#0A0A0A] relative flex flex-col border-l border-white/5 shadow-inner">
            <div className="flex items-center px-5 py-4 bg-[#141414] border-b border-white/5 relative shadow-sm z-10 shrink-0">
                <Terminal className="w-[18px] h-[18px] text-tertiary/70 mr-3" />
                <span className="text-[11px] font-bold font-mono text-on-surface-variant uppercase tracking-[0.2em]">
                  {activeBuildNumber ? `Output Log (Build #${activeBuildNumber})` : "Build Output Log"}
                </span>
                {buildStatus === "IN_PROGRESS" && (
                    <span className="absolute right-5 flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                    </span>
                )}
            </div>
            <div className="p-5 font-mono text-[13px] leading-relaxed text-[#00FF41] overflow-y-auto flex-1 whitespace-pre-wrap break-all shadow-[inset_0_4px_24px_rgba(0,0,0,0.5)] bg-gradient-to-b from-transparent to-[#050505]/50">
                {consoleLogs || (activeBuildNumber ? (
                  <span className="text-white/40 italic">Waiting for Jenkins process to assign worker logs...</span>
                ) : (
                  <span className="text-white/40">No active build logs running for this project view.</span>
                ))}
                <div ref={logsEndRef} className="h-4" />
            </div>
            </div>
        </div>
      </Panel>
    </div>
  );
}
