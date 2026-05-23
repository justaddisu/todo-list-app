import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { TASK_PRIORITIES } from "../utils/taskPriority.js";
import { User } from "./User.js";

export const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(140),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 140],
      },
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: "",
      validate: {
        len: [0, 1000],
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.ENUM(...TASK_PRIORITIES),
      allowNull: false,
      defaultValue: "medium",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("tags must be an array");
          }
          if (value.length > 10) {
            throw new Error("Maximum 10 tags per task");
          }
          if (!value.every(tag => typeof tag === "string" && tag.length > 0 && tag.length <= 30)) {
            throw new Error("Each tag must be a non-empty string up to 30 characters");
          }
        },
      },
    },
    recurrence: {
      type: DataTypes.ENUM("none", "daily", "weekly", "biweekly", "monthly"),
      defaultValue: "none",
    },
    recurrenceEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reminderMinutes: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("reminderMinutes must be an array");
          }
        },
      },
    },
    reminderLastNotifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    collaborators: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("collaborators must be an array");
          }
        },
      },
    },
    parentTaskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Tasks",
        key: "id",
      },
    },
    owner: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      index: true,
    },
  },
  { timestamps: true }
);

// Association
User.hasMany(Task, { foreignKey: "owner", as: "Tasks", onDelete: "CASCADE" });
Task.belongsTo(User, { foreignKey: "owner", as: "User" });
Task.hasMany(Task, { foreignKey: "parentTaskId", as: "RecurringInstances" });
