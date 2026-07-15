import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import DonutChart from "../components/charts/DonutChart.jsx";
import BarChart from "../components/charts/BarChart.jsx";

const STAT_CARDS = [
  { key: "total", label: "Total tasks", accent: "#6366f1" },
  { key: "done", label: "Completed", accent: "#14b8a6" },
  { key: "inProgress", label: "In progress", accent: "#f59e0b" },
  { key: "todo", label: "To do", accent: "#94a3b8" },
];

function dueLabel(dateStr) {
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return { text: "Due today", tone: "soon" };
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, tone: "overdue" };
  if (diff === 1) return { text: "Due tomorrow", tone: "soon" };
  if (diff <= 3) return { text: `In ${diff} days`, tone: "soon" };
  return { text: `In ${diff} days`, tone: "later" };
}

function DeadlineRow({ task }) {
  const label = task.dueDate
    ? dueLabel(task.dueDate)
    : { text: "Pending", tone: "later" };
  return (
    <li className="deadline-row">
      <span className={`priority priority-${task.priority}`}>{task.priority}</span>
      <div className="deadline-main">
        <span className="deadline-title">{task.title}</span>
        {task.project && <span className="deadline-project">{task.project}</span>}
      </div>
      <span className={`due-tag due-${label.tone}`}>{label.text}</span>
    </li>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/analytics/summary?range=${range}`)
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch(() => active && setError("Could not load analytics."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [range]);

  if (loading && !data) return <p className="container muted">Loading analytics…</p>;
  if (error) return <p className="container alert">{error}</p>;
  if (!data) return null;

  const { totals, timeline, byProject, byPriority, deadlines } = data;
  const hasTasks = totals.total > 0;

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1>Analytics</h1>
          <p className="muted">Your productivity at a glance.</p>
        </div>
        <Link to="/" className="btn btn-ghost">
          ← Projects
        </Link>
      </div>

      {!hasTasks ? (
        <div className="empty">
          <p>No data yet.</p>
          <p className="muted">Create a few tasks to see your analytics here.</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="stat-grid">
            {STAT_CARDS.map((c) => (
              <div className="stat-card" key={c.key}>
                <span className="stat-accent" style={{ background: c.accent }} />
                <span className="stat-value">{totals[c.key]}</span>
                <span className="stat-label">{c.label}</span>
              </div>
            ))}
          </div>

          <div className="analytics-grid">
            {/* Completion donut */}
            <section className="card">
              <h3 className="card-title">Completion rate</h3>
              <div className="donut-wrap">
                <DonutChart percent={totals.completionRate} />
              </div>
              <p className="muted center">
                {totals.done} of {totals.total} tasks done
              </p>
            </section>

            {/* Progress over time */}
            <section className="card wide">
              <div className="card-title-row">
                <h3 className="card-title">Progress over time</h3>
                <div className="segmented">
                  <button
                    className={range === "week" ? "active" : ""}
                    onClick={() => setRange("week")}
                  >
                    Week
                  </button>
                  <button
                    className={range === "month" ? "active" : ""}
                    onClick={() => setRange("month")}
                  >
                    Month
                  </button>
                </div>
              </div>
              <BarChart data={timeline.buckets} />
            </section>
          </div>

          <div className="analytics-grid">
            {/* Progress by project */}
            <section className="card wide">
              <h3 className="card-title">Progress by project</h3>
              <div className="project-progress">
                {byProject.length === 0 && (
                  <p className="muted">No projects yet.</p>
                )}
                {byProject.map((p) => {
                  const pct = p.total === 0 ? 0 : Math.round((p.done / p.total) * 100);
                  return (
                    <div className="progress-item" key={p.id}>
                      <div className="progress-top">
                        <span>
                          <i className="dot" style={{ background: p.color }} />
                          {p.name}
                        </span>
                        <span className="muted">
                          {p.done}/{p.total} · {pct}%
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%`, background: p.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="priority-summary">
                <span className="muted">Open tasks by priority:</span>
                <span className="priority priority-high">{byPriority.high} high</span>
                <span className="priority priority-medium">{byPriority.medium} medium</span>
                <span className="priority priority-low">{byPriority.low} low</span>
              </div>
            </section>

            {/* Deadlines */}
            <section className="card">
              <h3 className="card-title">Deadlines</h3>

              {deadlines.overdue.length > 0 && (
                <>
                  <p className="deadline-heading overdue-heading">
                    Overdue ({deadlines.overdue.length})
                  </p>
                  <ul className="deadline-list">
                    {deadlines.overdue.slice(0, 4).map((t) => (
                      <DeadlineRow key={t.id} task={t} />
                    ))}
                  </ul>
                </>
              )}

              <p className="deadline-heading">Upcoming</p>
              {deadlines.upcoming.length === 0 ? (
                <p className="muted">No upcoming deadlines. 🎉</p>
              ) : (
                <ul className="deadline-list">
                  {deadlines.upcoming.map((t) => (
                    <DeadlineRow key={t.id} task={t} />
                  ))}
                </ul>
              )}

              {deadlines.noDeadline && deadlines.noDeadline.length > 0 && (
                <>
                  <p className="deadline-heading">
                    No due date ({deadlines.noDeadlineCount})
                  </p>
                  <ul className="deadline-list">
                    {deadlines.noDeadline.map((t) => (
                      <DeadlineRow key={t.id} task={t} />
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
