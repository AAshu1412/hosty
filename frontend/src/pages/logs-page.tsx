import { useDeferredValue, useState, useEffect, useMemo, useRef } from "react";
import { Clock, GitBranch, Hash, Terminal, Activity, CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Panel } from "@/components/shared/panel";
import { SearchInput } from "@/components/shared/search-input";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuthStore } from "@/store/authStore";
import { useJenkinsStore } from "@/store/jenkinsStore";
import { cn } from "@/lib/utils";

export function LogsPage() {
  const [searchParams] = useSearchParams();
  const projectIdMap = searchParams.get("projectId") ?? null;
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const user = useAuthStore((state) => state.user);
  const getUser = useAuthStore((state) => state.getUser);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  
  const jenkins_console_output = useJenkinsStore((state) => state.jenkins_console_output);
  const jenkins_per_build_status = useJenkinsStore((state) => state.jenkins_per_build_status);

  // Auto-refresh the user object in the background if legally authenticated
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void getUser();
    }
  }, [getUser, sessionStatus]);

  const builds = useMemo(() => {
    if (!user || !user.repos) return [];
    console.log("/logs page: "+projectIdMap);
    
    let allBuilds = user.repos.flatMap((repo: any) => {
      const buildsArray = [...(repo.number_of_builds || [])];
      
      // The backend might not push the first/active build into the number_of_builds array immediately.
      // We explicitly inject the current tracking build_number into the history if it isn't listed natively.
      if (repo.build_number && !buildsArray.find((b: any) => b.build === repo.build_number)) {
         buildsArray.push({
            build: repo.build_number,
            created_at: repo.created_at || repo.updated_at || Date.now()
         });
      }
      
      return buildsArray.map((b: any) => {
         const repoNameMatch = repo.repo_url?.match(/github\.com\/[^\/]+\/([^\/.]+)/);
         const repoName = repoNameMatch ? repoNameMatch[1] : `Project-${repo.id}`;

         let status = "ready";
         if (b.build === repo.build_number) {
            status = repo.status === "success" ? "ready" : (repo.status === "failed" || repo.status === "error" ? "failed" : "building");
         } else if (b.status) {
            status = b.status === "success" ? "ready" : (b.status === "failed" || b.status === "error" ? "failed" : "building");
         }

         return {
           repoId: repo.id,
           repoName: repoName,
           repoFullName: repo.repo_url,
           branch: repo.branch,
           buildNumber: b.build,
           createdAt: b.created_at || b.created_at,
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

    return allBuilds.sort((a, b) => b.createdAt - a.createdAt);
  }, [user, projectIdMap, deferredQuery]);

  const isLoading = sessionStatus === 'bootstrapping' || sessionStatus === 'authenticating';

  const [activeBuild, setActiveBuild] = useState<any>(null);
  const [consoleLogs, setConsoleLogs] = useState<string>("");
  const [buildStatus, setBuildStatus] = useState<string | null>(null);
  
  const [historyStatusMap, setHistoryStatusMap] = useState<Record<string, string>>({});
  const fetchedStatusesRef = useRef<Set<string>>(new Set());

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Dynamically resolve and cache Jenkins statuses in the background for historical builds that don't have intrinsic backend status saved
  useEffect(() => {
     let isSubscribed = true;
     
     const resolveStatuses = async () => {
         for (const b of builds) {
             const key = `${b.repoId}-${b.buildNumber}`;
             
             // Prioritize the live active build object data if it exists natively before querying
             if (b.status === "failed" || b.status === "error") {
                 if (!historyStatusMap[key]) setHistoryStatusMap(prev => ({...prev, [key]: "failed"}));
                 fetchedStatusesRef.current.add(key);
                 continue;
             }

             if (fetchedStatusesRef.current.has(key)) continue;
             fetchedStatusesRef.current.add(key);

             try {
                const res = await jenkins_per_build_status(b.buildNumber);
                const netStatus = res.data?.result;
                let resolved = "ready";
                
                if (netStatus === "FAILURE" || netStatus === "ABORTED") resolved = "failed";
                else if (netStatus === "SUCCESS") resolved = "ready";
                else if (netStatus === null) resolved = "building";

                if (isSubscribed) {
                    setHistoryStatusMap(prev => ({...prev, [key]: resolved}));
                }
             } catch (e) {
                if (isSubscribed) {
                    setHistoryStatusMap(prev => ({...prev, [key]: "ready"}));
                }
             }
         }
     };

     void resolveStatuses();
     return () => { isSubscribed = false; };
  }, [builds, jenkins_per_build_status]);

  // Auto-select first build if none selected
  useEffect(() => {
    if (!activeBuild && builds.length > 0) {
       setActiveBuild(builds[0]);
    }
  }, [builds, activeBuild]);

  // Keep terminal autoscrolled
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  // Active polling listener
  useEffect(() => {
    if (!activeBuild?.buildNumber) return;

    let isActive = true;
    let pollInterval: ReturnType<typeof setInterval>;

    setConsoleLogs("");
    setBuildStatus("IN_PROGRESS");

    const checkStatus = async () => {
      try {
        const logRes = await jenkins_console_output(activeBuild.buildNumber);
        if (isActive && logRes.data) {
          setConsoleLogs(logRes.data);
        }

        const statusRes = await jenkins_per_build_status(activeBuild.buildNumber);
        const result = statusRes.data?.result as string | null;

        if (isActive) {
          if (result === "SUCCESS" || result === "FAILURE") {
            setBuildStatus(result);
            clearInterval(pollInterval);
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
    }, 4000); 

    return () => {
      isActive = false;
      clearInterval(pollInterval);
    };
  }, [activeBuild?.buildNumber, jenkins_console_output, jenkins_per_build_status, getUser]);
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeading
        eyebrow="Global Console"
        title="Deployment Logs"
        description="Monitor streaming Jenkins pipelines across all your repos. Quickly jump between environments to diagnose edge cases."
      />

      <Panel className="overflow-hidden border border-outline-variant/15 shadow-sm">
        <div className="flex flex-col lg:flex-row min-h-[600px] h-[75vh] md:max-h-[85vh]">
          
          {/* Left Navigation pane */}
          <div className="p-0 border-b lg:border-b-0 lg:border-r border-outline-variant/10 bg-surface-container-lowest flex flex-col w-full lg:w-[35%] xl:w-[30%]">
             <div className="border-b border-outline-variant/5 bg-surface-container-low/80 p-5 shrink-0">
                <SearchInput
                  className="w-full hover:bg-surface-container focus-within:bg-surface-container transition-colors"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find project, branch..."
                  value={query}
                />
             </div>
             <div className="flex-1 overflow-y-auto w-full p-4 space-y-2 bg-surface-container-lowest/50">
               {isLoading ? (
                  <div className="space-y-3">
                     {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-[14px] animate-pulse bg-surface-container/60 shadow-inner" />)}
                  </div>
               ) : builds.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant flex flex-col items-center justify-center opacity-70">
                     <Activity className="w-8 h-8 mb-3" />
                     <p className="text-sm">No deployment history found.</p>
                  </div>
               ) : (
                  builds.map((build, idx) => {
                     const isActive = activeBuild?.buildNumber === build.buildNumber;
                     return (
                     <button 
                        key={`${build.repoId}-${build.buildNumber}-${idx}`} 
                        onClick={() => setActiveBuild(build)}
                        className={cn("group w-full flex flex-col p-4 rounded-[16px] transition-all duration-200 border text-left cursor-pointer outline-none focus:ring-2 focus:ring-primary/20",
                          isActive 
                            ? "bg-primary/10 border-primary/30 shadow-sm" 
                            : "bg-surface-container-low/40 border-outline-variant/10 hover:bg-surface-container-low hover:border-outline-variant/30"
                        )}
                     >
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-2">
                             <Terminal className={cn("w-4 h-4", isActive ? "text-primary" : "text-on-surface-variant/70")} />
                             <h4 className={cn("font-bold tracking-tight text-sm", isActive ? "text-primary font-bold" : "text-on-surface")}>{build.repoName}</h4>
                           </div>
                           <StatusBadge status={(historyStatusMap[`${build.repoId}-${build.buildNumber}`] as any) || build.status} />
                        </div>
                        <div className="mt-2.5 flex items-center gap-2.5 text-[11px] font-mono text-on-surface-variant opacity-80">
                           <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{build.buildNumber}</span>
                           <span className="opacity-50">•</span>
                           <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{build.branch}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-on-surface-variant/60">
                           <Clock className="w-3 h-3" /> {new Date(build.createdAt).toLocaleString()}
                        </div>
                     </button>
                     );
                   })
               )}
             </div>
          </div>

          {/* Right Terminal pane */}
          <div className="p-0 bg-[#0A0A0A] relative flex flex-col flex-1 shadow-[inset_4px_0_24px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between px-5 py-4 bg-[#141414] border-b border-white/5 relative shadow-sm z-10 shrink-0">
                <div className="flex items-center">
                  <Terminal className="w-[18px] h-[18px] text-tertiary/70 mr-3" />
                  <span className="text-[11px] font-bold font-mono text-on-surface-variant uppercase tracking-[0.2em]">
                    {activeBuild ? `${activeBuild.repoName} (Build #${activeBuild.buildNumber})` : "Global output console"}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                   {buildStatus === "IN_PROGRESS" && (
                       <span className="flex h-2 w-2 relative mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                       </span>
                   )}
                   {buildStatus && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                         {buildStatus === "IN_PROGRESS" && <><CircleDashed className="w-3 h-3 animate-spin text-tertiary" /> Building...</>}
                         {buildStatus === "SUCCESS" && <><CheckCircle2 className="w-3 h-3 text-primary" /> Success</>}
                         {buildStatus === "FAILURE" && <><XCircle className="w-3 h-3 text-error" /> Failed</>}
                      </span>
                   )}
                </div>
            </div>

            <div className="p-5 font-mono text-[13px] leading-relaxed text-[#00FF41] overflow-y-auto flex-1 whitespace-pre-wrap break-all bg-gradient-to-b from-transparent to-[#050505]/50">
                {!activeBuild ? (
                  <div className="flex text-white/40 italic items-center justify-center h-full opacity-60">
                     Select a valid build session from the sidebar to establish a connection...
                  </div>
                ) : consoleLogs ? (
                  consoleLogs
                ) : (
                  <span className="text-white/40 italic">Establishing socket stream to Jenkins workers... hold on...</span>
                )}
                <div ref={logsEndRef} className="h-4" />
            </div>
          </div>
          
        </div>
      </Panel>
    </div>
  );
}
