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
