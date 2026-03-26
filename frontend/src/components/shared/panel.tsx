import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Panel({ className, children, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "panel-shadow rounded-[28px] border border-outline-variant/15 bg-surface-container/90 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
