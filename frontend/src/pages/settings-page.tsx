import { LogOut } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  if (!user) {
    return (
      <div className="rounded-[28px] border border-error/20 bg-error/10 p-5 text-sm text-error">
        Settings are unavailable. User data is missing.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeading
        eyebrow="Personal Workspace"
        title="Account settings"
        description="Manage identity, active sessions, and structural preferences for your Hosty account."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr]">
        <Panel className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 overflow-hidden rounded-[28px] border border-outline-variant/10 bg-surface-container-high items-center justify-center text-3xl font-bold uppercase text-tertiary">
                {user.avatar_url || (user as any).user?.avatar_url ? (
                  <img
                    alt={user.name || user.username || "Avatar"}
                    className="h-full w-full object-cover"
                    src={user.avatar_url || (user as any).user?.avatar_url || ""}
                  />
                ) : (
                  (user.name || user.username || "U").charAt(0)
                )}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                  Account Profile
                </p>
                <h3 className="text-2xl font-bold tracking-[-0.05em] text-on-surface">
                  {user.name || (user as any).user?.name || user.username}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {user.email || (user as any).user?.email || "No email provided"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 max-w-2xl">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                    Full name
                  </span>
                  <input
                    className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors opacity-70 cursor-not-allowed"
                    defaultValue={user.name || (user as any).user?.name || ""}
                    disabled
                    type="text"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                    Username
                  </span>
                  <input
                    className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors opacity-70 cursor-not-allowed"
                    defaultValue={user.username || (user as any).user?.username || ""}
                    disabled
                    type="text"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                    Email
                  </span>
                  <input
                    className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors opacity-70 cursor-not-allowed"
                    defaultValue={user.email || (user as any).user?.email || ""}
                    disabled
                    type="email"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                    Location
                  </span>
                  <input
                    className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors opacity-70 cursor-not-allowed"
                    defaultValue={(user as any).location || "Not specified"}
                    disabled
                    type="text"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                  Bio
                </span>
                <textarea
                  className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors opacity-70 cursor-not-allowed resize-none"
                  defaultValue={(user as any).bio || "No bio available"}
                  disabled
                  rows={3}
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                  GitHub Profile
                </span>
                <input
                  className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors opacity-70 cursor-not-allowed"
                  defaultValue={(user as any).html_url || ""}
                  disabled
                  type="url"
                />
              </label>
            </div>

            <Button disabled className="opacity-50">Locked via GitHub Provider</Button>
          </div>
        </Panel>

        <Panel className="border-error/15 bg-error/5 p-6 md:p-8">
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-error">
                Danger Zone
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">
                Session controls
              </h3>
            </div>
            <p className="text-sm leading-6 text-on-surface-variant max-w-2xl">
              Terminating your session will revoke the local authentication token.
              To completely erase your account and associated project deployments from the system, please contact support.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="secondary" onClick={clearSession}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout from Device
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
