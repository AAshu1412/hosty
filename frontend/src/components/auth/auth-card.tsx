import type { ReactNode } from "react";

import { Panel } from "@/components/shared/panel";

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <Panel className="p-6 sm:p-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-on-surface-variant/60">
            {eyebrow}
          </p>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
              {title}
            </h2>
            <p className="text-sm leading-6 text-on-surface-variant">
              {description}
            </p>
          </div>
        </div>
        {children}
      </div>
    </Panel>
  );
}
