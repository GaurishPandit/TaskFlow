import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Helper: fetch a project the current user owns, or null
async function findOwnedProject(projectId, userId) {
  return Project.findOne({ _id: projectId, owner: userId });
}

// GET /api/projects
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  // Attach a lightweight task count to each project
  const withCounts = await Promise.all(
    projects.map(async (p) => {
      const taskCount = await Task.countDocuments({ project: p._id });
      return { ...p.toObject(), taskCount };
    })
  );

  res.json(withCounts);
});

// POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  const project = await Project.create({
    name,
    description,
    color,
    owner: req.user._id,
  });
  res.status(201).json(project);
});

// PUT /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const { name, description, color } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (color !== undefined) project.color = color;

  await project.save();
  res.json(project);
});

// DELETE /api/projects/:id  (also removes its tasks)
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({ message: "Project deleted" });
});
