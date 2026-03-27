import { useState } from "react";
import { Clock3, MapPin, ShieldCheck, Trash2, UserRound } from "lucide-react";

import { NotificationToggle } from "@/components/settings/notification-toggle";
import { InfoRow } from "@/components/shared/info-row";
import { Panel } from "@/components/shared/panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { useSettingsData } from "@/hooks/use-dashboard-data";
import type { NotificationPreference } from "@/types/dashboard";
import { useSession } from "@/hooks/use-session";

export function SettingsPage() {
  const session = useSession();
  const { data, isLoading, error } = useSettingsData();
  const [notificationOverrides, setNotificationOverrides] = useState<
    Record<string, boolean>
  >({});
  const teamAccentClass = {
    "team-acme": "bg-tertiary-fixed",
    "team-growth": "bg-surface-container-highest",
  } as const;

  const togglePreference = (preferenceId: string) => {
    setNotificationOverrides((current) => ({
      ...current,
      [preferenceId]: !current[preferenceId],
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-[28px] bg-surface-container" />
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="h-[34rem] animate-pulse rounded-[28px] bg-surface-container" />
          <div className="h-[34rem] animate-pulse rounded-[28px] bg-surface-container" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[28px] border border-error/20 bg-error/10 p-5 text-sm text-error">
        {error ?? "Settings are unavailable."}
      </div>
    );
  }

  const notifications: NotificationPreference[] = data.notifications.map(
    (preference) => ({
      ...preference,
      enabled: notificationOverrides[preference.id] ?? preference.enabled,
    })
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Personal Workspace"
        title="Account settings"
        description="Manage identity, teams, notification preferences, and active sessions with the same visual system as the rest of the dashboard."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-[28px] border border-outline-variant/10 bg-surface-container-high">
                <img
                  alt={data.profile.fullName}
                  className="h-full w-full object-cover"
                  src={session.user?.avatar_url || ""}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                  Account Profile
                </p>
                <h3 className="text-2xl font-bold tracking-[-0.05em] text-on-surface">
                  {session.user?.name}
                </h3>
                <p className="text-sm text-on-surface-variant">{session.user?.email}</p>
                {/* <span className="inline-flex rounded-full border border-tertiary-container/20 bg-tertiary-container/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary-container">
                  {data.profile.plan}
                </span> */}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                    Full name
                  </span>
                  <input
                    className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/30"
                    defaultValue={session.user?.name}
                    type="text"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                    Username
                  </span>
                  <input
                    className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/30"
                    defaultValue={session.user?.username}
                    type="text"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                  Email
                </span>
                <input
                  className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/30"
                  defaultValue={session.user?.email || ""}
                  type="email"
                />
              </label>
            </div>

            {/* <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={MapPin} label="Location" value={session.user?.location} />
              <InfoRow icon={Clock3} label="Timezone" value={session.user?.timezone} />
            </div> */}

            <Button>Save changes</Button>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <div className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                    Teams
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">
                    Active teams
                  </h3>
                </div>
                <Button size="sm" variant="secondary">
                  Create team
                </Button>
              </div>

              <div className="grid gap-3">
                {data.teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-[24px] border border-outline-variant/10 bg-surface-container-low p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            teamAccentClass[team.id as keyof typeof teamAccentClass] ??
                            "bg-surface-container-high"
                          } text-lg font-black text-on-primary`}
                        >
                          {team.initials}
                        </div>
                        <div>
                          <p className="text-base font-semibold tracking-[-0.03em] text-on-surface">
                            {team.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {team.members} members • {team.projects} projects
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full border border-outline-variant/15 bg-surface-container-high px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface">
                        {team.role}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-on-surface-variant">
                      {team.plan} • {team.lastActivity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="p-6 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                Notifications
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">
                Preference center
              </h3>
            </div>
            <div>
              {notifications.map((preference) => (
                <NotificationToggle
                  key={preference.id}
                  onToggle={togglePreference}
                  preference={preference}
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel className="p-6">
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                Security
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">
                Active sessions
              </h3>
            </div>

            <div className="space-y-3">
              {data.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-outline-variant/10 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high p-3 text-tertiary-container">
                      {session.current ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <UserRound className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {session.label}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {session.device}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {session.location} • {session.lastSeen}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-outline-variant/15 bg-surface-container-high px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface">
                    {session.current ? "Current" : "Recent"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="border-error/15 bg-error/5 p-6">
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-error">
                Danger Zone
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">
                Sensitive actions
              </h3>
            </div>
            <p className="text-sm leading-6 text-on-surface-variant">
              {data.dangerZone.note}
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="secondary">{data.dangerZone.logoutLabel}</Button>
              <Button variant="danger">
                <Trash2 className="h-4 w-4" />
                {data.dangerZone.deleteLabel}
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
