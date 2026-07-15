import { useEffect, useState } from "react";

const STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];
const PRIORITIES = ["low", "medium", "high"];

// Used for both creating (task = null) and editing an existing task.
export default function TaskModal({ task, defaultStatus, onClose, onSave }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: defaultStatus || "todo",
    priority: "medium",
    dueDate: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      });
    }
  }, [task]);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        dueDate: form.dueDate || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEdit ? "Edit task" : "New task"}</h2>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              name="title"
              value={form.title}
              onChange={update}
              placeholder="What needs doing?"
              autoFocus
              required
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows={3}
              placeholder="Optional details"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Status</span>
              <select name="status" value={form.status} onChange={update}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select name="priority" value={form.priority} onChange={update}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Due date</span>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={update}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
