import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardShell } from "@/components/app-shell/dashboard-shell";
import { GuestRoute } from "@/components/auth/guest-route";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthCallbackPage } from "@/pages/auth-callback-page";
import { LoginPage } from "@/pages/login-page";
import { LogsPage } from "@/pages/logs-page";
import { OnboardingPage } from "@/pages/onboarding-page";
import { ProjectDetailsPage } from "@/pages/project-details-page";
import { ProjectsPage } from "@/pages/projects-page";
import { SettingsPage } from "@/pages/settings-page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/projects" />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/projects" />} />
    </Routes>
  );
}

export default App;
