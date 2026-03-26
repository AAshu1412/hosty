import { NavLink, useLocation } from "react-router-dom";
import { Panel } from "@/components/shared/panel";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/dashboard";
import { GripVertical } from "lucide-react";

interface SidebarNavProps {
  collapsed: boolean;
  items: NavItem[];
  onResizeStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onToggleCollapse: () => void;
  width: number;
}

export function SidebarNav({
  collapsed,
  items,
  onResizeStart,
  onToggleCollapse,
  width,
}: SidebarNavProps) {
  const location = useLocation();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden border-r border-outline-variant/10 bg-surface-container-lowest/95 px-4 py-5 lg:flex lg:flex-col"
      style={{ width }}
    >
      <div
        className={cn(
          "relative mb-8 flex rounded-[24px] border border-outline-variant/10 bg-surface-container/70 px-4 py-4",
          collapsed ? "justify-center" : "items-center gap-3"
        )}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-on-primary">
          <img src="/favicon.svg" alt="Hosty" className="h-8 w-8" />
        </div>
        {!collapsed ? (
          <div>
            <p className="text-base font-bold tracking-[-0.04em] text-on-surface">
              Hosty
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-tertiary-container">
              Acme Corp Workspace
            </p>
          </div>
        ) : null}

        {/* <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button> */}
      </div>

      <nav className="space-y-2">
        {items.map(({ id, href, icon: Icon, label, matches }) => (
          <NavLink
            key={id}
            title={collapsed ? label : undefined}
            to={href}
            className={({ isActive }) =>
              cn(
                "flex rounded-2xl px-4 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant transition-all duration-150 hover:bg-surface-container hover:text-on-surface",
                collapsed ? "justify-center" : "items-center gap-3",
                (isActive || matches(location.pathname)) &&
                  "soft-shadow bg-surface-container text-on-surface"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed ? label : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <Panel className={cn("p-4", collapsed && "px-3 py-4")}>
          {collapsed ? (
            <div className="flex justify-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-container-high text-tertiary-container"
                title="Status page operational"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-current" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                Workspace Health
              </p>
              <p className="text-sm font-medium text-on-surface">
                Production deploys are stable and live activity is streaming
                cleanly.
              </p>
              <div className="flex items-center gap-2 text-xs text-tertiary-container">
                <span className="h-2 w-2 rounded-full bg-current" />
                Status page operational
              </div>
            </div>
          )}
        </Panel>
      </div>

      <button
        aria-label="Resize sidebar"
        className="absolute inset-y-0 -right-3 hidden w-6 cursor-ew-resize items-center justify-center text-on-surface-variant/55 transition-colors hover:text-on-surface lg:flex"
        onDoubleClick={onToggleCollapse}
        onPointerDown={onResizeStart}
        style={{ touchAction: "none" }}
        type="button"
      >
        <span className="flex h-16 w-4 items-center justify-center rounded-full border border-outline-variant/15 bg-surface-container-lowest/95">
          <GripVertical className="h-4 w-4" />
        </span>
      </button>
    </aside>
  );
}
