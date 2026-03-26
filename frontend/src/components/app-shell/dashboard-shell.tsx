import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

import { MobileNav } from "@/components/app-shell/mobile-nav";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { TopBar } from "@/components/app-shell/top-bar";
import { getPageTitle, getPrimaryNavigation } from "@/lib/navigation";
import { getDefaultProjectId } from "@/mocks/dashboardRepository";

const SIDEBAR_STORAGE_KEY = "hosty.sidebar.desktop";
const SIDEBAR_DEFAULT_WIDTH = 272;
const SIDEBAR_MIN_WIDTH = 256;
const SIDEBAR_MAX_WIDTH = 360;
const SIDEBAR_COLLAPSE_THRESHOLD = 220;
const SIDEBAR_COLLAPSED_WIDTH = 88;

interface SidebarDesktopState {
  width: number;
  collapsed: boolean;
}

function getInitialSidebarState(): SidebarDesktopState {
  if (typeof window === "undefined") {
    return { width: SIDEBAR_DEFAULT_WIDTH, collapsed: false };
  }

  try {
    const rawValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);

    if (!rawValue) {
      return { width: SIDEBAR_DEFAULT_WIDTH, collapsed: false };
    }

    const parsed = JSON.parse(rawValue) as Partial<SidebarDesktopState>;
    const clampedWidth = Math.min(
      SIDEBAR_MAX_WIDTH,
      Math.max(SIDEBAR_MIN_WIDTH, Number(parsed.width) || SIDEBAR_DEFAULT_WIDTH)
    );

    return {
      width: clampedWidth,
      collapsed: Boolean(parsed.collapsed),
    };
  } catch {
    return { width: SIDEBAR_DEFAULT_WIDTH, collapsed: false };
  }
}

export function DashboardShell() {
  const location = useLocation();
  const params = useParams();
  const [sidebarState, setSidebarState] = useState<SidebarDesktopState>(
    getInitialSidebarState
  );
  const activeProjectId =
    params.projectId ??
    new URLSearchParams(location.search).get("projectId") ??
    getDefaultProjectId();
  const navigation = getPrimaryNavigation(activeProjectId);
  const desktopSidebarWidth = sidebarState.collapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : sidebarState.width;

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      JSON.stringify(sidebarState)
    );
  }, [sidebarState]);

  const handleSidebarResizeStart = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = sidebarState.collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : sidebarState.width;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const rawWidth = startWidth + (moveEvent.clientX - startX);

      setSidebarState((current) => {
        if (rawWidth < SIDEBAR_COLLAPSE_THRESHOLD) {
          if (current.collapsed) {
            return current;
          }

          return {
            width: current.width,
            collapsed: true,
          };
        }

        const nextWidth = Math.min(
          SIDEBAR_MAX_WIDTH,
          Math.max(SIDEBAR_MIN_WIDTH, rawWidth)
        );

        if (!current.collapsed && current.width === nextWidth) {
          return current;
        }

        return {
          width: nextWidth,
          collapsed: false,
        };
      });
    };

    const handlePointerUp = () => {
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleSidebarCollapseToggle = () => {
    setSidebarState((current) => ({
      width: current.width,
      collapsed: !current.collapsed,
    }));
  };

  const shellStyle = useMemo(
    () =>
      ({
        "--desktop-sidebar-width": `${desktopSidebarWidth}px`,
      }) as CSSProperties,
    [desktopSidebarWidth]
  );

  return (
    <div className="min-h-dvh bg-background text-on-surface" style={shellStyle}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-18%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-tertiary-container/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-8%] h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <SidebarNav
        collapsed={sidebarState.collapsed}
        items={navigation}
        onResizeStart={handleSidebarResizeStart}
        onToggleCollapse={handleSidebarCollapseToggle}
        width={desktopSidebarWidth}
      />

      <div className="relative lg:pl-[var(--desktop-sidebar-width)]">
        <TopBar title={getPageTitle(location.pathname)} />
        <main className="px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          <Outlet />
        </main>
      </div>

      <MobileNav items={navigation} />
    </div>
  );
}
