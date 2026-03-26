import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardShell } from "@/components/app-shell/dashboard-shell";
import { LogsPage } from "@/pages/logs-page";
import { ProjectDetailsPage } from "@/pages/project-details-page";
import { ProjectsPage } from "@/pages/projects-page";
import { SettingsPage } from "@/pages/settings-page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/projects" />} />
      <Route element={<DashboardShell />}>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/projects" />} />
    </Routes>
  );
}

export default App;
