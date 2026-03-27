import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-on-surface">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-5%] h-[26rem] w-[26rem] rounded-full bg-tertiary-container/14 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-12%] h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-outline-variant/10 bg-surface-container-low px-4 py-2 text-[10px] font-bold uppercase tracking-[0.26em] text-on-surface-variant/75">
              <span className="h-2 w-2 rounded-full bg-tertiary-container" />
              Hosty Access
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-balance text-4xl font-bold tracking-[-0.06em] text-on-surface sm:text-5xl">
                Ship from GitHub into your deployment workspace without friction.
              </h1>
            </div>
          </section>

          <section>{children}</section>
        </div>
      </div>
    </div>
  );
}
