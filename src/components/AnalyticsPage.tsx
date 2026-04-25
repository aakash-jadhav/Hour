import { useMemo } from "react";
import { Task } from "../types";
import {
  WEEKDAYS_MON_FIRST,
  bucketSpentByWeekdayMonFirst,
  formatFocusHm,
  sortAnalytics,
  totalSpentSeconds,
  wallSecondsToComplete,
} from "../utils";
import { IconCheckCircle, IconStopwatch, IconTrendLine } from "./icons";

type Props = {
  tasks: Task[];
};

function exportReportJson(tasks: Task[]) {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hour-focus-report-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AnalyticsPage({ tasks }: Props) {
  const totalSeconds = useMemo(() => totalSpentSeconds(tasks), [tasks]);
  const buckets = useMemo(() => bucketSpentByWeekdayMonFirst(tasks), [tasks]);
  const topTasks = useMemo(() => sortAnalytics(tasks).slice(0, 4), [tasks]);
  const bucketMax = useMemo(() => Math.max(0, ...buckets), [buckets]);
  const chartScaleMax = useMemo(() => Math.max(1, bucketMax), [bucketMax]);
  const tasksWithTime = useMemo(() => tasks.filter((t) => t.spentSeconds > 0), [tasks]);
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed && typeof t.completedAt === "number"),
    [tasks]
  );
  const completedCount = completedTasks.length;
  const avgWallToCompleteSeconds = useMemo(() => {
    if (completedTasks.length === 0) return 0;
    const sum = completedTasks.reduce((acc, t) => acc + (wallSecondsToComplete(t) ?? 0), 0);
    return Math.round(sum / completedTasks.length);
  }, [completedTasks]);

  const completionBars = useMemo(() => {
    const rows = completedTasks.map((t) => ({
      task: t,
      wall: wallSecondsToComplete(t) ?? 0,
    }));
    rows.sort((a, b) => (b.task.completedAt ?? 0) - (a.task.completedAt ?? 0));
    const max = Math.max(1, ...rows.map((r) => r.wall));
    return rows.slice(0, 8).map((r) => ({ ...r, pct: (r.wall / max) * 100 }));
  }, [completedTasks]);

  const avgSessionSeconds = useMemo(() => {
    if (tasksWithTime.length === 0) return 0;
    return Math.round(totalSeconds / tasksWithTime.length);
  }, [totalSeconds, tasksWithTime.length]);

  const goalHours = 6;
  const loggedFocusHours = totalSeconds / 3600;
  const goalProgressPct = Math.min(100, Math.round((loggedFocusHours / goalHours) * 100));
  const goalHoursDisplay = Math.min(goalHours, Math.round(loggedFocusHours * 10) / 10);

  const streakDays = useMemo(() => {
    if (tasks.length === 0) return 0;
    const minC = Math.min(...tasks.map((t) => t.createdAt));
    return Math.max(1, Math.ceil((Date.now() - minC) / 86400000));
  }, [tasks]);

  const top = topTasks[0];
  const insightBars = useMemo(() => {
    const slice = buckets.slice(0, 5);
    const m = Math.max(1, ...slice);
    return slice.map((v) => Math.round((v / m) * 100));
  }, [buckets]);

  const insightCopy = useMemo(() => {
    if (tasks.length === 0) {
      return "Add tasks on the board and run focus sessions to build a picture of where your time goes. This summary updates from your recorded sprint time.";
    }
    const lead = top
      ? `Your top focus is “${top.title}” at ${formatFocusHm(top.spentSeconds)}. `
      : "";
    return `${lead}Across ${tasks.length} task${tasks.length === 1 ? "" : "s"}, you have logged ${formatFocusHm(
      totalSeconds
    )}. Keep selecting a task before each sprint so every minute counts toward the right goal.`;
  }, [tasks.length, top, totalSeconds]);

  return (
    <div className="analytics-page">
      <main className="analytics-page__main" role="tabpanel" aria-label="Analytics">
        <section className="analytics-page__grid analytics-page__grid--metrics" aria-label="Summary metrics">
          <article className="analytics-page__metric brutal-card">
            <p className="analytics-page__metric-label">Total focus time</p>
            <p className="analytics-page__metric-value">{formatFocusHm(totalSeconds)}</p>
            <p className="analytics-page__metric-foot">
              <IconTrendLine className="analytics-page__metric-icon" />
              <span>All-time recorded</span>
            </p>
          </article>
          <article className="analytics-page__metric analytics-page__metric--accent brutal-card">
            <p className="analytics-page__metric-label">Tasks completed</p>
            <p className="analytics-page__metric-value">{completedCount}</p>
            <p className="analytics-page__metric-foot">
              <IconCheckCircle className="analytics-page__metric-icon" />
              <span>
                {completedCount > 0
                  ? `Avg. time to finish: ${formatFocusHm(avgWallToCompleteSeconds)}`
                  : "Check tasks done on the board"}
              </span>
            </p>
          </article>
          <article className="analytics-page__metric brutal-card">
            <p className="analytics-page__metric-label">Average session</p>
            <p className="analytics-page__metric-value">{formatFocusHm(avgSessionSeconds)}</p>
            <p className="analytics-page__metric-foot">
              <IconStopwatch className="analytics-page__metric-icon" />
              <span>{tasksWithTime.length ? "Per task with time" : "No sessions yet"}</span>
            </p>
          </article>
        </section>

        <section className="analytics-page__completion" aria-label="Completed task times">
          <article className="analytics-page__panel brutal-card">
            <h2 className="analytics-page__panel-title">Time to complete (on board)</h2>
            <p className="analytics-page__panel-hint">
              Wall time from task creation to when you marked it complete. Bar length is relative to the slowest task
              shown.
            </p>
            {completionBars.length === 0 ? (
              <p className="analytics-page__empty muted">No completed tasks yet. Tick the checkbox on a task card.</p>
            ) : (
              <ul className="analytics-page__completion-list">
                {completionBars.map(({ task, wall, pct }) => (
                  <li key={task.id} className="analytics-page__completion-item">
                    <span className="analytics-page__completion-name">{task.title}</span>
                    <span className="analytics-page__completion-time">{formatFocusHm(wall)}</span>
                    <div className="analytics-page__completion-track">
                      <div className="analytics-page__completion-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section className="analytics-page__grid analytics-page__grid--split" aria-label="Activity and goal">
          <article className="analytics-page__panel brutal-card">
            <div className="analytics-page__panel-head">
              <h2 className="analytics-page__panel-title">Focus activity</h2>
            </div>
            <p className="analytics-page__panel-hint">
              Time by weekday of task creation (proxy for when work was added).
            </p>
            <div className="analytics-page__chart" role="img" aria-label="Focus time by weekday">
              {WEEKDAYS_MON_FIRST.map((label, i) => (
                <div key={label} className="analytics-page__chart-col">
                  <div
                    className="analytics-page__chart-bar"
                    style={{ height: `${Math.max(6, (buckets[i]! / chartScaleMax) * 100)}%` }}
                  />
                  <span className="analytics-page__chart-label">{label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="analytics-page__panel brutal-card">
            <h2 className="analytics-page__panel-title">Daily goal</h2>
            <p className="analytics-page__goal-streak">Maintain the streak! {streakDays} day{streakDays === 1 ? "" : "s"} on the board.</p>
            <div className="analytics-page__goal-head">
              <span className="analytics-page__goal-tag">Progress</span>
              <span className="analytics-page__goal-pct">{goalProgressPct}%</span>
            </div>
            <div className="analytics-page__goal-track" role="progressbar" aria-valuenow={goalProgressPct} aria-valuemin={0} aria-valuemax={100}>
              <div className="analytics-page__goal-fill" style={{ width: `${goalProgressPct}%` }} />
            </div>
            <p className="analytics-page__goal-caption">
              {goalHoursDisplay} / {goalHours} focus hours (all-time vs 6h reference)
            </p>
          </article>
        </section>

        <section className="analytics-page__grid analytics-page__grid--split" aria-label="Tasks and insight">
          <article className="analytics-page__panel brutal-card">
            <h2 className="analytics-page__panel-title">Top focus tasks</h2>
            {topTasks.length === 0 ? (
              <p className="analytics-page__empty muted">No tracked time yet. Start a sprint from the task board.</p>
            ) : (
              <ul className="analytics-page__task-list">
                {(() => {
                  const max = Math.max(1, ...topTasks.map((t) => t.spentSeconds));
                  return topTasks.map((task) => (
                    <li key={task.id} className="analytics-page__task-item">
                      <div className="analytics-page__task-row">
                        <span className="analytics-page__task-name">{task.title}</span>
                        <strong className="analytics-page__task-time">{formatFocusHm(task.spentSeconds)}</strong>
                      </div>
                      <div className="analytics-page__task-bar-track">
                        <div
                          className="analytics-page__task-bar-fill"
                          style={{ width: `${(task.spentSeconds / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  ));
                })()}
              </ul>
            )}
          </article>

          <article className="analytics-page__insight">
            <h2 className="analytics-page__insight-title">Weekly insight</h2>
            <p className="analytics-page__insight-body">{insightCopy}</p>
            <div className="analytics-page__insight-spark" aria-hidden="true">
              {insightBars.map((h, i) => (
                <span key={i} className="analytics-page__insight-bar" style={{ height: `${Math.max(20, h)}%` }} />
              ))}
            </div>
            <button type="button" className="analytics-page__insight-export" onClick={() => exportReportJson(tasks)}>
              Export report
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}
