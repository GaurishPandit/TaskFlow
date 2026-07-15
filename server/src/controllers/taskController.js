import Task, { TASK_STATUSES } from "../models/Task.js";
import Project from "../models/Project.js";
import { asyncHandler } from "../middleware/errorHandler.js";

async function userOwnsProject(projectId, userId) {
  const project = await Project.findOne({ _id: projectId, owner: userId });
  return Boolean(project);
}

// GET /api/tasks?project=:id
export const getTasks = asyncHandler(async (req, res) => {
  const { project } = req.query;
  const filter = { owner: req.user._id };

  if (project) {
    if (!(await userOwnsProject(project, req.user._id))) {
      return res.status(404).json({ message: "Project not found" });
    }
    filter.project = project;
  }

  const tasks = await Task.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(tasks);
});

// POST /api/tasks
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, project } = req.body;

  if (!title || !project) {
    return res
      .status(400)
      .json({ message: "Title and project are required" });
  }
  if (!(await userOwnsProject(project, req.user._id))) {
    return res.status(404).json({ message: "Project not found" });
  }

  // Place new task at the end of its column
  const count = await Task.countDocuments({ project, status: status || "todo" });

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate || null,
    completedAt: status === "done" ? new Date() : null,
    order: count,
    project,
    owner: req.user._id,
  });

  res.status(201).json(task);
});

// PUT /api/tasks/:id
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (req.body.status && !TASK_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Track completion time on status transitions in/out of "done"
  if (req.body.status && req.body.status !== task.status) {
    if (req.body.status === "done") {
      task.completedAt = new Date();
    } else if (task.status === "done") {
      task.completedAt = null;
    }
  }

  const fields = ["title", "description", "status", "priority", "dueDate", "order"];
  for (const field of fields) {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  }

  await task.save();
  res.json(task);
});

// DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!task) return res.status(404).json({ message: "Task not found" });

  res.json({ message: "Task deleted" });
});
