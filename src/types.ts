export type Task = {
  id: string;
  title: string;
  spentSeconds: number;
  createdAt: number;
  /** Checked when the user marks the task done from the task board. */
  completed: boolean;
  /** Set when `completed` becomes true (wall-clock end of task lifecycle). */
  completedAt?: number;
};
