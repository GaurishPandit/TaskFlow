import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import TaskCard from "../components/TaskCard.jsx";
import TaskModal from "../components/TaskModal.jsx";

// Only the active/pending columns live on the board now.
// Completed tasks move into a collapsible section below.
const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
];

export default function Board() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state: { mode: "create" | "edit", task, status }
  const [modal, setModal] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get("/projects"),
        api.get(`/tasks?project=${projectId}`),
      ]);
      const current = projectsRes.data.find((p) => p._id === projectId);
      setProject(current || null);
      setTasks(tasksRes.data);
    } catch {
      setError("Could not load this board.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Split tasks into active columns vs. completed
  const { columns, completed } = useMemo(() => {
    const columns = { todo: [], "in-progress": [] };
    const completed = [];
    for (const t of tasks) {
      if (t.status === "done") completed.push(t);
      else (columns[t.status] || columns.todo).push(t);
    }
    completed.sort(
      (a, b) =>
        new Date(b.completedAt || b.updatedAt) -
        new Date(a.completedAt || a.updatedAt)
    );
    return { columns, completed };
  }, [tasks]);

  // --- CRUD ---
  async function saveTask(values) {
    if (modal?.mode === "edit") {
      const { data } = await api.put(`/tasks/${modal.task._id}`, values);
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
    } else {
      const { data } = await api.post("/tasks", { ...values, project: projectId });
      setTasks((prev) => [...prev, data]);
    }
    setModal(null);
  }

  async function deleteTask(task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await api.delete(`/tasks/${task._id}`);
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
  }

  // Mark complete (or reopen). The task stays in the DB either way, so it
  // still counts toward analytics — it just leaves the active board.
  async function toggleComplete(task) {
    const status = task.status === "done" ? "todo" : "done";
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id
          ? {
              ...t,
              status,
              completedAt: status === "done" ? new Date().toISOString() : null,
            }
          : t
      )
    );
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
    } catch {
      setTasks(previous); // roll back on failure
      setError("Could not update task.");
    }
  }

  // --- Drag & drop between active columns ---
  function handleDragStart(e, task) {
    e.dataTransfer.setData("text/plain", task._id);
    e.dataTransfer.effectAllowed = "move";
  }

  async function handleDrop(e, status) {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t._id === id);
    if (!task || task.status === status) return;

    // Optimistic update
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
    try {
      await api.put(`/tasks/${id}`, { status });
    } catch {
      setTasks(previous); // roll back on failure
      setError("Could not move task.");
    }
  }

  if (loading) return <p className="container muted">Loading board…</p>;

  if (!project) {
    return (
      <main className="container">
        <p className="alert">Project not found.</p>
        <Link to="/" className="btn btn-ghost">
          ← Back to projects
        </Link>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="board-head">
        <div className="board-title">
          <Link to="/" className="back-link">
            ← Projects
          </Link>
          <h1>
            <span
              className="project-dot"
              style={{ background: project.color }}
            />
            {project.name}
          </h1>
          {project.description && <p className="muted">{project.description}</p>}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModal({ mode: "create", status: "todo" })}
        >
          + Add task
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="board board-2col">
        {COLUMNS.map((col) => (
          <section
            key={col.key}
            className={`column ${dragOverCol === col.key ? "drag-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(col.key);
            }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <div className="column-head">
              <span>{col.label}</span>
              <span className="count">{columns[col.key].length}</span>
            </div>

            <div className="column-body">
              {columns[col.key].map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => setModal({ mode: "edit", task: t })}
                  onDelete={deleteTask}
                  onToggleComplete={toggleComplete}
                  onDragStart={handleDragStart}
                />
              ))}

              <button
                className="add-in-column"
                onClick={() => setModal({ mode: "create", status: col.key })}
              >
                + Add
              </button>
            </div>
          </section>
        ))}
      </div>

      {/* Completed tasks — hidden from the active board but kept for analytics */}
      {completed.length > 0 && (
        <section className="completed-section">
          <button
            className="completed-toggle"
            onClick={() => setShowCompleted((s) => !s)}
          >
            <span className="completed-chevron">{showCompleted ? "▾" : "▸"}</span>
            <span className="completed-check">✓</span>
            Completed
            <span className="count">{completed.length}</span>
          </button>

          {showCompleted && (
            <div className="completed-list">
              {completed.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => setModal({ mode: "edit", task: t })}
                  onDelete={deleteTask}
                  onToggleComplete={toggleComplete}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {modal && (
        <TaskModal
          task={modal.mode === "edit" ? modal.task : null}
          defaultStatus={modal.status}
          onClose={() => setModal(null)}
          onSave={saveTask}
        />
      )}
    </main>
  );
}
