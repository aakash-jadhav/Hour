import { ONE_HOUR_SECONDS } from "./utils";

export const SPRINT_STORAGE_KEY = "hour-focus-sprint-v1";

export type SprintPersistV1 = {
  version: 1;
  remainingSeconds: number;
  running: boolean;
  sprintEngaged: boolean;
  /** Wall time (ms) when `remainingSeconds` was last saved while running, or last pause snapshot. */
  anchorAt: number;
  activeTaskId: string | null;
};

export type SprintHydration = {
  remainingSeconds: number;
  running: boolean;
  sprintEngaged: boolean;
  /** Seconds to add to the persisted active task once (wall time while away / refresh). */
  countedSecondsForTask: number;
  persistedActiveTaskId: string | null;
};

const defaults: SprintHydration = {
  remainingSeconds: ONE_HOUR_SECONDS,
  running: false,
  sprintEngaged: false,
  countedSecondsForTask: 0,
  persistedActiveTaskId: null,
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Recompute remaining time from wall clock when `running` was true at last save. */
export function hydrateSprintFromStorage(): SprintHydration {
  try {
    const raw = localStorage.getItem(SPRINT_STORAGE_KEY);
    if (!raw) return defaults;
    const p: unknown = JSON.parse(raw);
    if (!isRecord(p) || p.version !== 1) return defaults;

    const remainingAtAnchor = Math.max(0, Math.floor(Number(p.remainingSeconds) || 0));
    const running = Boolean(p.running);
    const sprintEngaged = Boolean(p.sprintEngaged);
    const anchorAt = typeof p.anchorAt === "number" ? p.anchorAt : Date.now();
    const activeTaskId = typeof p.activeTaskId === "string" ? p.activeTaskId : null;

    if (!running) {
      return {
        remainingSeconds: Math.min(ONE_HOUR_SECONDS, remainingAtAnchor),
        running: false,
        sprintEngaged,
        countedSecondsForTask: 0,
        persistedActiveTaskId: activeTaskId,
      };
    }

    const elapsed = Math.max(0, Math.floor((Date.now() - anchorAt) / 1000));
    const countedSecondsForTask = Math.min(elapsed, remainingAtAnchor);
    const newRem = remainingAtAnchor - countedSecondsForTask;
    return {
      remainingSeconds: newRem,
      running: newRem > 0,
      sprintEngaged,
      countedSecondsForTask,
      persistedActiveTaskId: activeTaskId,
    };
  } catch {
    return defaults;
  }
}

export function saveSprintToStorage(state: Omit<SprintPersistV1, "version">): void {
  try {
    const payload: SprintPersistV1 = {
      version: 1,
      remainingSeconds: Math.max(0, Math.floor(state.remainingSeconds)),
      running: state.running,
      sprintEngaged: state.sprintEngaged,
      anchorAt: state.anchorAt,
      activeTaskId: state.activeTaskId,
    };
    localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

export function clearSprintStorage(): void {
  try {
    localStorage.removeItem(SPRINT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
