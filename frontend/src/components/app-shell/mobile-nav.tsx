import { NavLink, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/dashboard";

interface MobileNavProps {
  items: NavItem[];
}

export function MobileNav({ items }: MobileNavProps) {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[28px] border border-outline-variant/15 bg-surface-container-lowest/95 p-2 shadow-[0_18px_48px_rgba(0,0,0,0.45)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map(({ id, href, icon: Icon, mobileLabel, matches }) => (
          <NavLink
            key={id}
            to={href}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-[22px] px-2 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant transition-all",
                (isActive || matches(location.pathname)) &&
                  "bg-surface-container text-on-surface"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {mobileLabel}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
