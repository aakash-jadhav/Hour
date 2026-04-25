import { Task } from "./types";

export const ONE_HOUR_SECONDS = 60 * 60;

export const WEEKDAYS_MON_FIRST = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export function totalSpentSeconds(tasks: Task[]): number {
  return tasks.reduce((sum, t) => sum + t.spentSeconds, 0);
}

/** Buckets total `spentSeconds` by weekday of `createdAt` (Mon–Sun). */
export function bucketSpentByWeekdayMonFirst(tasks: Task[]): number[] {
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  for (const t of tasks) {
    const day = new Date(t.createdAt).getDay();
    const monFirstIdx = day === 0 ? 6 : day - 1;
    buckets[monFirstIdx] += t.spentSeconds;
  }
  return buckets;
}

/** e.g. `8h 20m`, `52m`, `0m`. */
export function formatFocusHm(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0m";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

/** Wall time from `createdAt` to `completedAt` when the task is marked complete. */
export function wallSecondsToComplete(task: Task): number | null {
  if (!task.completed || typeof task.completedAt !== "number") return null;
  return Math.max(0, Math.floor((task.completedAt - task.createdAt) / 1000));
}

export function formatClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function sortAnalytics(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.spentSeconds - a.spentSeconds);
}
