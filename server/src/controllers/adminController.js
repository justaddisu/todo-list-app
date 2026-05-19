import { Op } from "sequelize";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { normalizePriority } from "../utils/taskPriority.js";

export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, completedTasks] = await Promise.all([
      User.count(),
      Task.count(),
      Task.count({ where: { completed: true } }),
    ]);

    return res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "isAdmin", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.id === req.user.id) {
      res.status(400);
      throw new Error("Cannot delete your own account");
    }

    await user.destroy();
    return res.json({ message: "User deleted" });
  } catch (error) {
    return next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      include: [{ model: User, as: "User", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
};

export const deleteAnyTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    await task.destroy();
    return res.json({ message: "Task deleted" });
  } catch (error) {
    return next(error);
  }
};

// ── User CRUD ──────────────────────────────────────────────────────────────

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, isAdmin: adminFlag } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("name, email and password are required");
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      isAdmin: adminFlag === true || adminFlag === "true",
    });

    const { password: _pw, ...safe } = user.toJSON();
    return res.status(201).json(safe);
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const { name, email, password, role, isAdmin: adminFlag } = req.body;

    if (email && email !== user.email) {
      const conflict = await User.findOne({ where: { email } });
      if (conflict) {
        res.status(409);
        throw new Error("Email already in use");
      }
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password) user.password = password; // hook re-hashes
    if (role !== undefined) user.role = role;
    if (adminFlag !== undefined) user.isAdmin = adminFlag === true || adminFlag === "true";

    await user.save();
    const { password: _pw, ...safe } = user.toJSON();
    return res.json(safe);
  } catch (error) {
    return next(error);
  }
};

// ── Task CRUD (admin-scope) ────────────────────────────────────────────────

export const createAnyTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, completed, owner } = req.body;
    if (!title) {
      res.status(400);
      throw new Error("Title is required");
    }
    if (!owner) {
      res.status(400);
      throw new Error("Owner (userId) is required");
    }

    const ownerUser = await User.findByPk(owner);
    if (!ownerUser) {
      res.status(404);
      throw new Error("Owner user not found");
    }

    const task = await Task.create({
      title,
      description: description || "",
      priority: normalizePriority(priority) || "medium",
      dueDate: dueDate || null,
      completed: completed === true || completed === "true",
      owner,
    });

    const fullTask = await Task.findByPk(task.id, {
      include: [{ model: User, as: "User", attributes: ["id", "name", "email"] }],
    });

    return res.status(201).json(fullTask);
  } catch (error) {
    return next(error);
  }
};

export const updateAnyTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    const { title, description, priority, dueDate, completed, owner } = req.body;

    if (owner) {
      const ownerUser = await User.findByPk(owner);
      if (!ownerUser) {
        res.status(404);
        throw new Error("Owner user not found");
      }
      task.owner = owner;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) {
      const p = normalizePriority(priority);
      if (p) task.priority = p;
    }
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (completed !== undefined) task.completed = completed === true || completed === "true";

    await task.save();

    const fullTask = await Task.findByPk(task.id, {
      include: [{ model: User, as: "User", attributes: ["id", "name", "email"] }],
    });

    return res.json(fullTask);
  } catch (error) {
    return next(error);
  }
};
