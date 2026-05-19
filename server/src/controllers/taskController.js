import { Task } from "../models/Task.js";
import { normalizePriority } from "../utils/taskPriority.js";

export const createTask = async (req, res, next) => {
  try {
    const { title, description = "", dueDate = null, priority = "medium" } = req.body;

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error("Task title is required");
    }

    const parsedPriority = normalizePriority(priority);
    if (!parsedPriority) {
      res.status(400);
      throw new Error("Priority must be one of: low, medium, high");
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      dueDate,
      priority: parsedPriority,
      owner: req.user.id,
    });

    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      where: { owner: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(tasks);
  } catch (error) {
    return next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, owner: req.user.id },
    });
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    return res.status(200).json(task);
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, owner: req.user.id },
    });
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    const { title, description, completed, dueDate, priority } = req.body;

    if (typeof title === "string") {
      task.title = title.trim();
    }

    if (typeof description === "string") {
      task.description = description;
    }

    if (typeof completed === "boolean") {
      task.completed = completed;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    if (priority !== undefined) {
      const parsedPriority = normalizePriority(priority);
      if (!parsedPriority) {
        res.status(400);
        throw new Error("Priority must be one of: low, medium, high");
      }
      task.priority = parsedPriority;
    }

    await task.save();
    return res.status(200).json(task);
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, owner: req.user.id },
    });
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    await task.destroy();
    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    return next(error);
  }
};
