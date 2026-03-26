import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant/70">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-1">
          <h2 className="text-balance text-2xl font-bold tracking-[-0.04em] text-on-surface sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
