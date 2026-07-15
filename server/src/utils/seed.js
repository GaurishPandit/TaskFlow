// Seeds a demo user with a couple of projects and tasks.
// Run with:  npm run seed
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

dotenv.config();

async function seed() {
  await connectDB();

  const email = "demo@taskflow.dev";

  // Reset any previous demo data
  const existing = await User.findOne({ email });
  if (existing) {
    await Task.deleteMany({ owner: existing._id });
    await Project.deleteMany({ owner: existing._id });
    await existing.deleteOne();
  }

  const user = await User.create({
    name: "Demo User",
    email,
    password: "password123",
  });

  const website = await Project.create({
    name: "Website Redesign",
    description: "Marketing site refresh for Q3.",
    color: "#6366f1",
    owner: user._id,
  });

  const mobile = await Project.create({
    name: "Mobile App",
    description: "React Native MVP.",
    color: "#ec4899",
    owner: user._id,
  });

  // Helpers to build relative dates for realistic-looking analytics
  const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };
  const daysAhead = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
  };

  await Task.insertMany([
    // Website — a mix of completed (across the last week) and open work
    { title: "Audit current pages", status: "done", priority: "medium", project: website._id, owner: user._id, order: 0, completedAt: daysAgo(6) },
    { title: "Competitor research", status: "done", priority: "low", project: website._id, owner: user._id, order: 1, completedAt: daysAgo(5) },
    { title: "Wireframe homepage", status: "done", priority: "medium", project: website._id, owner: user._id, order: 2, completedAt: daysAgo(3) },
    { title: "Design new hero section", status: "in-progress", priority: "high", project: website._id, owner: user._id, order: 0, dueDate: daysAhead(2) },
    { title: "Write homepage copy", status: "todo", priority: "medium", project: website._id, owner: user._id, order: 0, dueDate: daysAhead(5) },
    { title: "Fix broken contact form", status: "todo", priority: "high", project: website._id, owner: user._id, order: 1, dueDate: daysAgo(1) },

    // Mobile
    { title: "Set up CI/CD", status: "done", priority: "high", project: mobile._id, owner: user._id, order: 0, completedAt: daysAgo(2) },
    { title: "Build auth screens", status: "in-progress", priority: "medium", project: mobile._id, owner: user._id, order: 0, dueDate: daysAhead(1) },
    { title: "Integrate push notifications", status: "todo", priority: "low", project: mobile._id, owner: user._id, order: 0, dueDate: daysAhead(9) },
    { title: "App store screenshots", status: "todo", priority: "medium", project: mobile._id, owner: user._id, order: 1 },
  ]);

  console.log("✅ Seed complete.");
  console.log("   Login with  demo@taskflow.dev  /  password123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
