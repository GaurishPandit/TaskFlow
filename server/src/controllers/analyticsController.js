import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Returns a YYYY-MM-DD key in local server time
function dayKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/analytics/summary?range=week|month
export const getSummary = asyncHandler(async (req, res) => {
  const range = req.query.range === "month" ? "month" : "week";
  const days = range === "month" ? 30 : 7;
  const userId = req.user._id;

  const [tasks, projects] = await Promise.all([
    Task.find({ owner: userId }),
    Project.find({ owner: userId }),
  ]);

  // --- Totals ---
  const totals = { total: tasks.length, todo: 0, inProgress: 0, done: 0 };
  const byPriority = { low: 0, medium: 0, high: 0 };

  for (const t of tasks) {
    if (t.status === "todo") totals.todo += 1;
    else if (t.status === "in-progress") totals.inProgress += 1;
    else if (t.status === "done") totals.done += 1;

    if (t.status !== "done" && byPriority[t.priority] !== undefined) {
      byPriority[t.priority] += 1;
    }
  }
  // Anything not done is pending — including tasks with no due date
  totals.pending = totals.todo + totals.inProgress;
  totals.completionRate =
    totals.total === 0 ? 0 : Math.round((totals.done / totals.total) * 100);

  // --- Progress over time (completed & created per day) ---
  const buckets = [];
  const index = {};
  const today = startOfToday();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const bucket = { date: key, completed: 0, created: 0 };
    index[key] = bucket;
    buckets.push(bucket);
  }

  for (const t of tasks) {
    if (t.completedAt) {
      const key = dayKey(t.completedAt);
      if (index[key]) index[key].completed += 1;
    }
    const createdKey = dayKey(t.createdAt);
    if (index[createdKey]) index[createdKey].created += 1;
  }

  // --- Per-project breakdown ---
  const projectMap = {};
  for (const p of projects) {
    projectMap[p._id.toString()] = {
      id: p._id,
      name: p.name,
      color: p.color,
      total: 0,
      done: 0,
    };
  }
  for (const t of tasks) {
    const entry = projectMap[t.project?.toString()];
    if (!entry) continue;
    entry.total += 1;
    if (t.status === "done") entry.done += 1;
  }
  const byProject = Object.values(projectMap).sort((a, b) => b.total - a.total);

  // --- Deadlines ---
  const now = startOfToday();
  const open = tasks.filter((t) => t.status !== "done" && t.dueDate);
  const projectName = (id) => projectMap[id?.toString()]?.name || "";

  const overdue = open
    .filter((t) => new Date(t.dueDate) < now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map((t) => ({
      id: t._id,
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
      project: projectName(t.project),
    }));

  const upcoming = open
    .filter((t) => new Date(t.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 8)
    .map((t) => ({
      id: t._id,
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
      project: projectName(t.project),
    }));

  // Pending tasks with no due date at all — still surfaced so they aren't lost
  const noDeadlineTasks = tasks.filter((t) => t.status !== "done" && !t.dueDate);
  const noDeadline = noDeadlineTasks.slice(0, 8).map((t) => ({
    id: t._id,
    title: t.title,
    dueDate: null,
    priority: t.priority,
    status: t.status,
    project: projectName(t.project),
  }));

  res.json({
    totals,
    byPriority,
    timeline: { range, buckets },
    byProject,
    deadlines: {
      overdue,
      upcoming,
      noDeadline,
      noDeadlineCount: noDeadlineTasks.length,
    },
  });
});
