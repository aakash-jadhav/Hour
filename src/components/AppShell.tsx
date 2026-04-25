import { Dispatch, SetStateAction } from "react";
import { NavLink, Navigate, useLocation } from "react-router-dom";
import { Activity } from "./Activity";
import { AnalyticsPage } from "./AnalyticsPage";
import { FocusPage } from "./FocusPage";
import { brandIconUrl } from "../brandIcon";
import { Task } from "../types";
import { IconAnalytics, IconMoon, IconSun, IconTasks } from "./icons";

type Props = {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  sprintFullscreen: boolean;
  setSprintFullscreen: Dispatch<SetStateAction<boolean>>;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
};

export function AppShell({
  darkMode,
  setDarkMode,
  sprintFullscreen,
  setSprintFullscreen,
  tasks,
  setTasks,
}: Props) {
  const location = useLocation();
  const path = location.pathname;

  if (path !== "/" && path !== "/analytics") {
    return <Navigate to="/" replace />;
  }

  const tasksTabVisible = path !== "/analytics";
  const analyticsTabVisible = path === "/analytics";
  const hideHeader = path === "/" && sprintFullscreen;

  return (
    <div className="app-shell">
      {!hideHeader && (
        <header className="topbar brutal-card">
          <NavLink to="/" end className="topbar__brand topbar__brand-link" aria-label="Hour Focus home">
            <img src={brandIconUrl} alt="" className="topbar__brand-icon" width={40} height={40} decoding="async" />
            <h1 className="brand-title">Hour Focus</h1>
          </NavLink>
          <nav className="topbar__tabs" role="tablist" aria-label="Main pages">
            <NavLink
              to="/"
              end
              role="tab"
              className={({ isActive }) => `nav-pill btn-with-icon${isActive ? " nav-pill--active" : ""}`}
              aria-label="Tasks"
            >
              <IconTasks />
              <span className="btn-label">Tasks</span>
            </NavLink>
            <NavLink
              to="/analytics"
              role="tab"
              className={({ isActive }) => `nav-pill btn-with-icon${isActive ? " nav-pill--active" : ""}`}
              aria-label="Analytics"
            >
              <IconAnalytics />
              <span className="btn-label">Analytics</span>
            </NavLink>
          </nav>
          <button
            type="button"
            className="btn-theme-toggle btn-with-icon"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setDarkMode((prev) => !prev)}
          >
            <span className="btn-theme-toggle__inner">
              {darkMode ? <IconSun /> : <IconMoon />}
              <span className="btn-label">{darkMode ? "Light" : "Dark"}</span>
            </span>
          </button>
        </header>
      )}

      <Activity mode={tasksTabVisible ? "visible" : "hidden"}>
        <FocusPage
          tasks={tasks}
          setTasks={setTasks}
          sprintFullscreen={sprintFullscreen}
          setSprintFullscreen={setSprintFullscreen}
          surfaceActive={tasksTabVisible}
        />
      </Activity>
      <Activity mode={analyticsTabVisible ? "visible" : "hidden"}>
        <AnalyticsPage tasks={tasks} />
      </Activity>
    </div>
  );
}
