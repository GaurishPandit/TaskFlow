const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High" };

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onDragStart,
}) {
  const due = formatDate(task.dueDate);
  const done = task.status === "done";

  return (
    <div
      className={`task-card ${done ? "is-done" : ""}`}
      draggable={!done}
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
    >
      <div className="task-card-top">
        <div className="task-card-left">
          <button
            className={`check ${done ? "checked" : ""}`}
            title={done ? "Reopen task" : "Mark complete"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task);
            }}
          >
            {done ? "✓" : ""}
          </button>
          <span className={`priority priority-${task.priority}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
        </div>

        <button
          className="icon-btn sm"
          title="Delete task"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
        >
          ✕
        </button>
      </div>

      <div className="task-body" onClick={() => onEdit(task)}>
        <p className="task-title">{task.title}</p>
        {task.description && <p className="task-desc">{task.description}</p>}
        {due && <span className="task-due">📅 {due}</span>}
      </div>
    </div>
  );
}
