import { Task } from "./types";

const STORAGE_KEY = "hour-focus-tasks-v1";

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.spentSeconds === "number" &&
    typeof t.createdAt === "number" &&
    (t.completed === undefined || typeof t.completed === "boolean") &&
    (t.completedAt === undefined || typeof t.completedAt === "number")
  );
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTask).map((t) => {
      const completed = Boolean(t.completed);
      return {
        ...t,
        spentSeconds: Math.max(0, Math.floor(t.spentSeconds)),
        completed,
        completedAt: completed && typeof t.completedAt === "number" ? t.completedAt : undefined,
      };
    });
  } catch {
    return [];
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore quota / private mode
  }
}

export { STORAGE_KEY };
