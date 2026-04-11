import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import { useSession } from "@/hooks/use-session";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const session = useSession();
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/10 bg-surface/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container text-sm font-black text-primary lg:hidden">
            H
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
              Hosty Dashboard
            </p>
            <h1 className="truncate text-sm font-semibold tracking-[-0.03em] text-on-surface sm:text-base">
              {title}
            </h1>
          </div>
        </div>

        {/* <div className="hidden flex-1 items-center justify-center lg:flex">
          <SearchInput
            className="w-full max-w-xl"
            placeholder="Search projects, logs, or teams..."
          />
        </div> */}

        <div className="flex items-center gap-2 text-on-surface-variant">
          {/* <button className="hidden rounded-2xl p-2 transition-colors hover:bg-surface-container hover:text-on-surface md:inline-flex">
            <MessageSquareMore className="h-4 w-4" />
          </button>
          <button className="hidden rounded-2xl p-2 transition-colors hover:bg-surface-container hover:text-on-surface md:inline-flex">
            <CircleHelp className="h-4 w-4" />
          </button>
          <button className="hidden rounded-2xl p-2 transition-colors hover:bg-surface-container hover:text-on-surface md:inline-flex">
            <FileText className="h-4 w-4" />
          </button>
          <button className="rounded-2xl p-2 transition-colors hover:bg-surface-container hover:text-on-surface">
            <Bell className="h-4 w-4" />
          </button> */}
          <button
            className="hidden rounded-2xl border border-outline-variant/15 bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface sm:inline-flex"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
          <div className="h-9 w-9 overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-high">
            <img
              alt="User avatar"
              className="h-full w-full object-cover"
              src={session.user?.avatar_url ?? undefined}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
