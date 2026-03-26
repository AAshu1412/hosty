import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/shared/panel";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Panel className="mx-auto max-w-2xl p-8 text-center">
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant/60">
          Missing Resource
        </p>
        <h2 className="text-2xl font-bold tracking-[-0.04em] text-on-surface">
          {title}
        </h2>
        <p className="text-sm leading-6 text-on-surface-variant">{description}</p>
        <Button asChild className="mt-2">
          <Link to="/projects">Back to projects</Link>
        </Button>
      </div>
    </Panel>
  );
}
