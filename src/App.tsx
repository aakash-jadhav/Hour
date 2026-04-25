import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { BottomWave } from "./components/BottomWave";
import { isEditableKeyboardTarget } from "./keyboard";
import { Task } from "./types";
import { loadTasksFromStorage, saveTasksToStorage } from "./tasksStorage";

export function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [darkMode, setDarkMode] = useState(false);
  const [sprintFullscreen, setSprintFullscreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = window.setTimeout(() => saveTasksToStorage(tasks), 400);
    return () => window.clearTimeout(id);
  }, [tasks]);

  useEffect(() => {
    if (location.pathname === "/analytics") {
      setSprintFullscreen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key !== "a" && event.key !== "A") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableKeyboardTarget(event.target)) return;
      event.preventDefault();
      const onAnalytics = location.pathname === "/analytics";
      navigate(onAnalytics ? "/" : "/analytics");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, location.pathname]);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BottomWave />
      <div className="app-routes">
        <Routes>
          <Route
            path="/*"
            element={
              <AppShell
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                sprintFullscreen={sprintFullscreen}
                setSprintFullscreen={setSprintFullscreen}
                tasks={tasks}
                setTasks={setTasks}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}
