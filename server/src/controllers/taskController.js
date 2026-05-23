import { Task } from "../models/Task.js";
import { Op } from "sequelize";
import { normalizePriority } from "../utils/taskPriority.js";
import { generateRecurringInstances } from "../utils/recurrence.js";
import { User } from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";

const getCollaborators = (task) => (Array.isArray(task.collaborators) ? task.collaborators : []);
const isOwner = (task, userId) => task.owner === userId;
const hasTaskAccess = (task, userId) =>
  isOwner(task, userId) || getCollaborators(task).some((c) => c.userId === userId);
const hasEditAccess = (task, userId) =>
  isOwner(task, userId) ||
  getCollaborators(task).some((c) => c.userId === userId && (c.permission || "view") === "edit");

// Get all unique tags for current user
export const getTags = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      where: { owner: req.user.id },
      attributes: ["tags"],
      raw: true,
    });

    // Flatten and deduplicate tags
    const allTags = tasks.flatMap(t => t.tags || []);
    const uniqueTags = [...new Set(allTags)].sort();

    return res.status(200).json({ tags: uniqueTags });
  } catch (error) {
    return next(error);
  }
};

// Get tasks filtered by tag(s)
export const getTasksByTag = async (req, res, next) => {
  try {
    const { tag } = req.query;

    if (!tag) {
      res.status(400);
      throw new Error("Tag parameter is required");
    }

    const tasks = await Task.findAll({
      where: {
        owner: req.user.id,
        tags: {
          [Op.contains]: [tag],
        },
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(tasks);
  } catch (error) {
    return next(error);
  }
};

export const getUpcomingReminders = async (req, res, next) => {
  try {
    const now = new Date();
    const tasks = await Task.findAll({
      where: {
        owner: req.user.id,
        completed: false,
        dueDate: { [Op.ne]: null },
      },
      order: [["dueDate", "ASC"]],
    });

    const upcoming = tasks.filter((task) => {
      const due = new Date(task.dueDate);
      const reminders = Array.isArray(task.reminderMinutes) ? task.reminderMinutes : [];
      return reminders.some((minutes) => {
        const reminderTime = new Date(due.getTime() - Number(minutes || 0) * 60 * 1000);
        return reminderTime <= now;
      });
    });

    return res.status(200).json(upcoming);
  } catch (error) {
    return next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description = "",
      dueDate = null,
      priority = "medium",
      tags = [],
      recurrence = "none",
      recurrenceEnd = null,
      reminderMinutes = [],
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error("Task title is required");
    }

    const parsedPriority = normalizePriority(priority);
    if (!parsedPriority) {
      res.status(400);
      throw new Error("Priority must be one of: low, medium, high");
    }

    // Validate and normalize tags
    let normalizedTags = [];
    if (Array.isArray(tags)) {
      normalizedTags = tags
        .map(tag => (typeof tag === "string" ? tag.trim() : ""))
        .filter(tag => tag.length > 0 && tag.length <= 30)
        .slice(0, 10); // Max 10 tags
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      dueDate,
      priority: parsedPriority,
      tags: normalizedTags,
      recurrence: ["none", "daily", "weekly", "biweekly", "monthly"].includes(recurrence) ? recurrence : "none",
      recurrenceEnd,
      reminderMinutes: Array.isArray(reminderMinutes)
        ? reminderMinutes.map((m) => Number(m)).filter((m) => Number.isFinite(m) && m >= 0)
        : [],
      owner: req.user.id,
    });

    // Generate recurring instances if recurrence is enabled
    if (recurrence !== "none" && recurrence) {
      const instances = await generateRecurringInstances(task);
      if (instances.length > 0) {
        await Task.bulkCreate(instances);
      }
    }

    await logActivity({
      actorId: req.user.id,
      entityType: "task",
      entityId: task.id,
      action: "create",
      metadata: { title: task.title },
    });

    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { tag } = req.query;
    const tasks = await Task.findAll({
      order: [["createdAt", "DESC"]],
    });

    const visible = tasks.filter((task) => hasTaskAccess(task, req.user.id));
    const filtered = tag ? visible.filter((task) => (task.tags || []).includes(tag)) : visible;
    return res.status(200).json(filtered);
  } catch (error) {
    return next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    if (!hasTaskAccess(task, req.user.id)) {
      res.status(403);
      throw new Error("Not authorized to view this task");
    }

    return res.status(200).json(task);
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    if (!hasEditAccess(task, req.user.id)) {
      res.status(403);
      throw new Error("Not authorized to edit this task");
    }

    const {
      title,
      description,
      completed,
      dueDate,
      priority,
      tags,
      recurrence,
      recurrenceEnd,
      reminderMinutes,
    } = req.body;

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

    if (Array.isArray(tags)) {
      const normalizedTags = tags
        .map(tag => (typeof tag === "string" ? tag.trim() : ""))
        .filter(tag => tag.length > 0 && tag.length <= 30)
        .slice(0, 10); // Max 10 tags
      task.tags = normalizedTags;
    }

    if (recurrence !== undefined) {
      task.recurrence = ["none", "daily", "weekly", "biweekly", "monthly"].includes(recurrence) ? recurrence : "none";
    }

    if (recurrenceEnd !== undefined) {
      task.recurrenceEnd = recurrenceEnd || null;
    }

    if (Array.isArray(reminderMinutes)) {
      task.reminderMinutes = reminderMinutes
        .map((m) => Number(m))
        .filter((m) => Number.isFinite(m) && m >= 0);
    }

    await task.save();
    await logActivity({
      actorId: req.user.id,
      entityType: "task",
      entityId: task.id,
      action: "update",
      metadata: { title: task.title },
    });
    return res.status(200).json(task);
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    if (!isOwner(task, req.user.id)) {
      res.status(403);
      throw new Error("Only owner can delete this task");
    }

    await task.destroy();
    await logActivity({
      actorId: req.user.id,
      entityType: "task",
      entityId: task.id,
      action: "delete",
      metadata: { title: task.title },
    });
    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    return next(error);
  }
};

export const shareTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    if (!isOwner(task, req.user.id)) {
      res.status(403);
      throw new Error("Only owner can share this task");
    }

    const { userId, permission = "view" } = req.body;
    if (!userId) {
      res.status(400);
      throw new Error("userId is required");
    }
    const target = await User.findByPk(userId);
    if (!target) {
      res.status(404);
      throw new Error("User not found");
    }
    if (target.id === req.user.id) {
      res.status(400);
      throw new Error("Owner already has access");
    }

    const collaborators = getCollaborators(task).filter((c) => c.userId !== userId);
    collaborators.push({
      userId,
      permission: permission === "edit" ? "edit" : "view",
      sharedAt: new Date().toISOString(),
    });

    task.collaborators = collaborators;
    await task.save();
    await logActivity({
      actorId: req.user.id,
      entityType: "task",
      entityId: task.id,
      action: "share",
      metadata: { sharedWith: userId, permission },
    });
    return res.status(200).json(task);
  } catch (error) {
    return next(error);
  }
};

export const unshareTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    if (!isOwner(task, req.user.id)) {
      res.status(403);
      throw new Error("Only owner can unshare this task");
    }

    const { userId } = req.params;
    task.collaborators = getCollaborators(task).filter((c) => c.userId !== userId);
    await task.save();
    await logActivity({
      actorId: req.user.id,
      entityType: "task",
      entityId: task.id,
      action: "unshare",
      metadata: { removedUser: userId },
    });
    return res.status(200).json(task);
  } catch (error) {
    return next(error);
  }
};
