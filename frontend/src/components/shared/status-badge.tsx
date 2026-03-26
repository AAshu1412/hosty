import { cn } from "@/lib/utils";
import type { DeploymentStatus, ProjectStatus } from "@/types/dashboard";

interface StatusBadgeProps {
  status: ProjectStatus | DeploymentStatus;
  className?: string;
}

const badgeStyles: Record<ProjectStatus | DeploymentStatus, string> = {
  ready:
    "border-tertiary-container/20 bg-tertiary-container/10 text-tertiary-container",
  building: "border-primary/10 bg-primary/10 text-primary",
  warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
  failed: "border-error/20 bg-error/10 text-error",
  queued: "border-secondary/20 bg-secondary/10 text-secondary",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]",
        badgeStyles[status],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
