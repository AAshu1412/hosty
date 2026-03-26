import { useDeferredValue, useState } from "react";
import { Download, Filter, PauseCircle, PlayCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { LogEntryRow } from "@/components/logs/log-entry-row";
import { InfoRow } from "@/components/shared/info-row";
import { Panel } from "@/components/shared/panel";
import { SearchInput } from "@/components/shared/search-input";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useProjectLogs } from "@/hooks/use-dashboard-data";
import { Cpu, Globe2, Hash, Server, Timer } from "lucide-react";

export function LogsPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;
  const [query, setQuery] = useState("");
  const [followLive, setFollowLive] = useState(true);
  const deferredQuery = useDeferredValue(query);
  const { data, isLoading, error } = useProjectLogs(projectId);

  const filteredEntries =
    data?.entries.filter((entry) =>
      [entry.timestamp, entry.level, entry.message, entry.detail ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery.toLowerCase())
    ) ?? [];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Streaming Console"
        title="Build logs"
        description="Inspect mocked deployment output, filter through entries, and validate the console layout before connecting real pipeline data."
        action={
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-outline-variant/15 bg-surface-container-low px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant sm:flex">
              <span className="h-2 w-2 rounded-full bg-tertiary-container" />
              {followLive ? "Live" : "Paused"}
            </div>
            <Button
              onClick={() => setFollowLive((value) => !value)}
              variant="secondary"
            >
              {followLive ? (
                <PauseCircle className="h-4 w-4" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              {followLive ? "Pause" : "Resume"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <Panel className="overflow-hidden">
          <div className="border-b border-outline-variant/10 bg-surface-container-low/80 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <SearchInput
                className="w-full xl:max-w-md"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search logs, levels, traces..."
                value={query}
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-[48rem] overflow-y-auto bg-surface-container-lowest/70 p-4 font-mono">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-2xl bg-surface-container"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-error/20 bg-error/10 p-4 text-sm text-error">
                {error}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEntries.map((entry) => (
                  <LogEntryRow entry={entry} key={entry.id} />
                ))}
              </div>
            )}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-6">
            {data ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                      Deployment status
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-[-0.04em] text-on-surface">
                      {data.deploymentLabel}
                    </h3>
                  </div>
                  <StatusBadge status={data.status} />
                </div>

                <div className="space-y-4">
                  <InfoRow icon={Globe2} label="Region" value={data.region} />
                  <InfoRow icon={Cpu} label="Runtime" value={data.runtime} />
                  <InfoRow icon={Timer} label="Duration" value={data.duration} />
                  <InfoRow icon={Server} label="Environment" value={data.environment} />
                  <InfoRow icon={Hash} label="Commit" value={data.commitSha} />
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel className="p-6">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                Session details
              </p>
              <div className="space-y-3 rounded-[24px] border border-outline-variant/10 bg-surface-container-low p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Started</span>
                  <span className="font-medium text-on-surface">
                    {data?.startedAt ?? "Loading"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Branch</span>
                  <span className="font-medium text-on-surface">{data?.branch}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Follow mode</span>
                  <span className="font-medium text-on-surface">
                    {followLive ? "Enabled" : "Paused"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Visible entries</span>
                  <span className="font-medium text-on-surface">
                    {filteredEntries.length}
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
