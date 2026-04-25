import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity } from "./Activity";
import { IconPlus } from "./icons";
import { TaskCard } from "./TaskCard";
import { TimerPanel } from "./TimerPanel";
import { Task } from "../types";
import { isEditableKeyboardTarget } from "../keyboard";

function createTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    spentSeconds: 0,
    createdAt: Date.now(),
    completed: false,
  };
}

export type FocusPageProps = {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  sprintFullscreen: boolean;
  setSprintFullscreen: Dispatch<SetStateAction<boolean>>;
  /** Tasks surface is the active tab (not hidden under Activity). */
  surfaceActive: boolean;
};

export function FocusPage({
  tasks,
  setTasks,
  sprintFullscreen,
  setSprintFullscreen,
  surfaceActive,
}: FocusPageProps) {
  const [newTask, setNewTask] = useState("");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [sprintLocksTaskSelection, setSprintLocksTaskSelection] = useState(false);
  const reduceMotion = useReducedMotion();

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [tasks, activeTaskId]
  );

  const openTaskCount = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;
    const task = createTask(title);
    setTasks((prev) => [...prev, task]);
    if (!sprintLocksTaskSelection) {
      setActiveTaskId(task.id);
    }
    setNewTask("");
  };

  const updateTask = (id: string, title: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, title } : task)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const toggleComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const willComplete = !task.completed;
    if (willComplete && activeTaskId === id) {
      setActiveTaskId(null);
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: willComplete,
              completedAt: willComplete ? Date.now() : undefined,
            }
          : t
      )
    );
  };

  const onTick = useCallback(() => {
    setTasks((prev) => {
      if (!activeTaskId) return prev;
      return prev.map((task) =>
        task.id === activeTaskId && !task.completed ? { ...task, spentSeconds: task.spentSeconds + 1 } : task
      );
    });
  }, [activeTaskId]);

  useEffect(() => {
    if (tasks.length === 0) {
      setActiveTaskId(null);
      return;
    }
    const active = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
    if (active && !active.completed) return;

    if (sprintLocksTaskSelection) {
      if (activeTaskId && (!active || active.completed)) {
        setActiveTaskId(null);
      }
      return;
    }

    const firstOpen = tasks.find((t) => !t.completed);
    setActiveTaskId(firstOpen?.id ?? null);
  }, [tasks, activeTaskId, sprintLocksTaskSelection]);

  useEffect(() => {
    if (!surfaceActive) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape" && sprintFullscreen) {
        setSprintFullscreen(false);
        return;
      }
      if (event.key !== "f" && event.key !== "F") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableKeyboardTarget(event.target)) return;
      setSprintFullscreen((prev) => !prev);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [surfaceActive, sprintFullscreen, setSprintFullscreen]);

  useEffect(() => {
    document.body.style.overflow = sprintFullscreen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sprintFullscreen]);

  const fsTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className={sprintFullscreen ? "focus-page focus-page--fs" : "focus-page"}>
      <AnimatePresence>
        {sprintFullscreen && (
          <motion.div
            key="fullscreen-backdrop"
            className="fullscreen-backdrop"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fsTransition}
          />
        )}
      </AnimatePresence>

      <main className={sprintFullscreen ? "layout layout--sprint-fs" : "layout"} role="tabpanel" aria-label="Tasks">
        <Activity mode={sprintFullscreen ? "hidden" : "visible"}>
          <article className="task-window">
            <div className="task-window__chrome">
              <div className="task-window__chrome-inner">
                <strong className="task-window__chrome-label">Your tasks</strong>
                <div className="task-window__decor" aria-hidden="true">
                  <span className="task-window__dot" />
                  <span className="task-window__dot" />
                </div>
              </div>
            </div>

            <div className="task-window__body">
              <div className="task-window__title-row">
                <h3 className="task-window__heading">Task board</h3>
                <span className="task-window__badge" aria-label={`${openTaskCount} active tasks`}>
                  ACTIVE : {openTaskCount}
                </span>
              </div>
              <p className="task-window__lead">
                Add tasks, mark them complete, edit titles, and delete when done. Select an open task and start the hour
                sprint on the right.
              </p>

              <div className="add-row-wrap">
                <label className="add-row__field-label" htmlFor="new-task-input">
                  New task
                </label>
                <div className="add-row">
                  <input
                    id="new-task-input"
                    className="add-row__input"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter a task… (Enter to add)"
                    value={newTask}
                    onChange={(event) => setNewTask(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTask();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-press btn-press--add add-row__submit btn-with-icon"
                    onClick={addTask}
                    aria-label="Add task"
                  >
                    <IconPlus />
                    <span className="btn-label">Add</span>
                  </button>
                </div>
              </div>

              <motion.ul layout className="task-list">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    selected={activeTaskId === task.id}
                    taskSelectDisabled={sprintLocksTaskSelection && activeTaskId !== task.id}
                    onSelect={() => setActiveTaskId(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onRename={(title) => updateTask(task.id, title)}
                    onToggleComplete={toggleComplete}
                  />
                ))}
              </motion.ul>
            </div>
          </article>
        </Activity>

        <TimerPanel
          activeTask={activeTask}
          onTick={onTick}
          fullscreen={sprintFullscreen}
          onFullscreenChange={setSprintFullscreen}
          onSprintLocksTaskSelection={setSprintLocksTaskSelection}
          countdownActive={surfaceActive}
        />
      </main>
    </div>
  );
}
