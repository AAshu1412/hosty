import { cn } from "@/lib/utils";
import type { LogEntry } from "@/types/dashboard";

interface LogEntryRowProps {
  entry: LogEntry;
}

const levelStyles = {
  info: "bg-tertiary-container/10 text-tertiary-container",
  success: "bg-emerald-500/10 text-emerald-300",
  warn: "bg-yellow-500/10 text-yellow-300",
  error: "bg-error/10 text-error",
} as const;

export function LogEntryRow({ entry }: LogEntryRowProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-3 py-3 transition-colors hover:bg-surface-container",
        entry.level === "error" && "bg-error/5",
        entry.level === "warn" && "bg-yellow-500/5"
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <span className="shrink-0 font-mono text-xs text-on-surface-variant/60 md:w-28">
          {entry.timestamp}
        </span>
        <span
          className={cn(
            "inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
            levelStyles[entry.level]
          )}
        >
          {entry.level}
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm text-on-surface">{entry.message}</p>
          {entry.detail ? (
            <pre className="mt-3 overflow-x-auto rounded-2xl border border-outline-variant/10 bg-surface-container-high/70 p-3 font-mono text-xs leading-6 text-on-surface-variant whitespace-pre-wrap">
              {entry.detail}
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  );
}
