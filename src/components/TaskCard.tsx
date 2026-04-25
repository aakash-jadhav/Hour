import { useState } from "react";
import { motion } from "framer-motion";
import { IconPencil, IconTrash } from "./icons";
import { Task } from "../types";

type Props = {
  task: Task;
  selected: boolean;
  /** When true, the title control is disabled so the user cannot switch the sprint task. */
  taskSelectDisabled?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
  onToggleComplete: (id: string) => void;
};

export function TaskCard({
  task,
  selected,
  taskSelectDisabled = false,
  onSelect,
  onDelete,
  onRename,
  onToggleComplete,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.title);
  const checkId = `task-complete-${task.id}`;

  return (
    <motion.li
      layout
      className={selected ? "task-card selected" : "task-card"}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <label className="task-card__check-label" htmlFor={checkId}>
        <input
          id={checkId}
          type="checkbox"
          className="task-card__check-input"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          aria-label={task.completed ? `Mark “${task.title}” not done` : `Mark “${task.title}” complete`}
        />
        <span className="task-card__check-box" aria-hidden="true" />
      </label>

      {isEditing ? (
        <input
          className="task-card__input"
          aria-label="Task name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => {
            onRename(value.trim() || task.title);
            setIsEditing(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onRename(value.trim() || task.title);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={`task-title-btn${task.completed ? " task-title-btn--done" : ""}`}
          onClick={onSelect}
          disabled={task.completed || taskSelectDisabled}
          aria-current={selected ? "true" : undefined}
        >
          {task.title}
        </button>
      )}

      <div className="actions">
        <button
          type="button"
          className="btn-press btn-press--sm btn-with-icon"
          aria-label="Edit task"
          onClick={() => setIsEditing(true)}
        >
          <IconPencil />
          <span className="btn-label">Edit</span>
        </button>
        <button
          type="button"
          className="btn-press btn-press--sm btn-press--delete btn-with-icon"
          aria-label="Delete task"
          onClick={onDelete}
        >
          <IconTrash />
          <span className="btn-label">Delete</span>
        </button>
      </div>
    </motion.li>
  );
}
