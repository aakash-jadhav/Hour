import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BottomWave } from "./BottomWave";
import { IconPause, IconPlay, IconRestart } from "./icons";
import { ONE_HOUR_SECONDS, formatClock } from "../utils";
import { Task } from "../types";

type Props = {
  activeTask: Task | null;
  remainingSeconds: number;
  running: boolean;
  sprintEngaged: boolean;
  fullscreen: boolean;
  onFullscreenChange: (next: boolean) => void;
  onSprintLocksTaskSelection?: (locked: boolean) => void;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  /** Increment when the tasks tab becomes visible so the session date reflects "now". */
  sessionDateRefreshKey: number;
};

function IconEnterFullscreen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
    </svg>
  );
}

function IconExitFullscreen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9V4H4M20 4h-5v5M15 15v5h5M4 20h5v-5"
      />
    </svg>
  );
}

function formatSessionDate(d: Date) {
  return {
    iso: d.toISOString().slice(0, 10),
    label: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(d),
  };
}

export function TimerPanel({
  activeTask,
  remainingSeconds,
  running,
  sprintEngaged,
  fullscreen,
  onFullscreenChange,
  onSprintLocksTaskSelection,
  onStart,
  onPause,
  onRestart,
  sessionDateRefreshKey,
}: Props) {
  const sessionDate = useMemo(() => formatSessionDate(new Date()), [sessionDateRefreshKey]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    onSprintLocksTaskSelection?.(sprintEngaged);
  }, [sprintEngaged, onSprintLocksTaskSelection]);

  const progress = useMemo(
    () => ((ONE_HOUR_SECONDS - remainingSeconds) / ONE_HOUR_SECONDS) * 100,
    [remainingSeconds]
  );

  const layoutEase = reduceMotion ? ([0, 0, 1, 1] as const) : ([0.22, 1, 0.36, 1] as const);
  const layoutDuration = reduceMotion ? 0.01 : 0.45;

  return (
    <motion.aside
      layout
      className={fullscreen ? "sprint-card sprint-card--fullscreen" : "sprint-card"}
      transition={{
        layout: { duration: layoutDuration, ease: layoutEase },
      }}
    >
      {fullscreen && <BottomWave variant="layer" />}
      <div className="sprint-card__content">
        <div className="sprint-card__top">
          <div className="sprint-card__meta">
            <svg
              className="sprint-card__icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 6a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7Z"
                clipRule="evenodd"
              />
            </svg>
            <time className="sprint-card__time" dateTime={sessionDate.iso}>
              {sessionDate.label}
            </time>
          </div>
          <button
            type="button"
            className="sprint-card__icon-btn"
            onClick={() => onFullscreenChange(!fullscreen)}
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {fullscreen ? <IconExitFullscreen /> : <IconEnterFullscreen />}
          </button>
        </div>

        <h3 className="sprint-card__title">One Hour Sprint</h3>
        <p
          className={
            activeTask ? "sprint-card__task-name" : "sprint-card__task-name sprint-card__task-name--empty"
          }
        >
          {activeTask ? activeTask.title : "No task selected"}
        </p>

        <div className="sprint-card__timer">
          <motion.div className="clock" key={remainingSeconds} animate={{ scale: [1, 1.015, 1] }}>
            {formatClock(remainingSeconds)}
          </motion.div>
          <div
            className="timer-progress"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="One hour sprint elapsed"
          >
            <div className="timer-progress__track">
              <motion.div
                className="timer-progress__fill"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
              />
            </div>
          </div>

          <div className="timer-actions timer-actions--sprint">
            <button
              type="button"
              className="timer-btn timer-btn--start btn-with-icon"
              aria-label="Start timer"
              onClick={onStart}
              disabled={!activeTask || Boolean(activeTask.completed) || running || remainingSeconds === 0}
            >
              <IconPlay />
              <span className="btn-label">Start focus</span>
            </button>
            <button
              type="button"
              className="timer-btn timer-btn--pause btn-with-icon"
              aria-label="Pause timer"
              onClick={onPause}
              disabled={!running}
            >
              <IconPause />
              <span className="btn-label">Pause</span>
            </button>
            <button
              type="button"
              className="timer-btn timer-btn--restart btn-with-icon"
              aria-label="Restart timer"
              onClick={onRestart}
            >
              <IconRestart />
              <span className="btn-label">Restart</span>
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
