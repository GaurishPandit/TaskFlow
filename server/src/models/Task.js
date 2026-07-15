import mongoose from "mongoose";

export const TASK_STATUSES = ["todo", "in-progress", "done"];
export const TASK_PRIORITIES = ["low", "medium", "high"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    // Set when the task moves to "done", cleared when it moves back out.
    // Powers the weekly/monthly progress analytics.
    completedAt: {
      type: Date,
      default: null,
    },
    // Position within a column, used to keep manual ordering stable
    order: {
      type: Number,
      default: 0,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
