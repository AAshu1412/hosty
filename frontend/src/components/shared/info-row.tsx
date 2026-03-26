import type { LucideIcon } from "lucide-react";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high/80 p-2.5 text-on-surface-variant">
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/70">
          {label}
        </p>
        <p className="text-sm font-medium text-on-surface">{value}</p>
      </div>
    </div>
  );
}
