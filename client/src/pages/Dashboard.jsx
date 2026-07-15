import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: COLORS[0] });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch {
      setError("Could not load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createProject(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "", color: COLORS[0] });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create project.");
    }
  }

  async function deleteProject(id) {
    if (!confirm("Delete this project and all its tasks?")) return;
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1>Your Projects</h1>
          <p className="muted">Pick a project to open its board.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New project"}
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      {showForm && (
        <form className="card project-form" onSubmit={createProject}>
          <div className="field">
            <span>Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Website Redesign"
              autoFocus
            />
          </div>
          <div className="field">
            <span>Description</span>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="field">
            <span>Color</span>
            <div className="swatches">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`swatch ${form.color === c ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
          </div>
          <button className="btn btn-primary">Create</button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading projects…</p>
      ) : projects.length === 0 ? (
        <div className="empty">
          <p>No projects yet.</p>
          <p className="muted">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <div className="project-card card" key={p._id}>
              <div className="project-color" style={{ background: p.color }} />
              <Link to={`/projects/${p._id}`} className="project-body">
                <h3>{p.name}</h3>
                {p.description && <p className="muted">{p.description}</p>}
                <span className="badge">{p.taskCount} tasks</span>
              </Link>
              <button
                className="icon-btn"
                title="Delete project"
                onClick={() => deleteProject(p._id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
