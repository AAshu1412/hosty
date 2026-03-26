import { Bolt, Mail, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NotificationPreference } from "@/types/dashboard";

interface NotificationToggleProps {
  preference: NotificationPreference;
  onToggle: (id: string) => void;
}

export function NotificationToggle({
  preference,
  onToggle,
}: NotificationToggleProps) {
  const Icon =
    {
      bolt: Bolt,
      warning: TriangleAlert,
      mail: Mail,
    }[preference.icon] ?? Bolt;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant/10 px-4 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high/80 p-2.5 text-on-surface-variant">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{preference.label}</p>
          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
            {preference.description}
          </p>
        </div>
      </div>

      <button
        aria-pressed={preference.enabled}
        className={cn(
          "relative h-6 w-11 rounded-full border transition-colors",
          preference.enabled
            ? "border-tertiary-container/20 bg-tertiary-container"
            : "border-outline-variant/20 bg-surface-container-highest"
        )}
        onClick={() => onToggle(preference.id)}
        type="button"
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
            preference.enabled ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
