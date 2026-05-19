import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "todo_app",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // Lightweight migration guard: add missing priority column for existing Task tables.
    const queryInterface = sequelize.getQueryInterface();
    const taskTable = await queryInterface.describeTable("Tasks");
    if (!taskTable.priority) {
      await queryInterface.addColumn("Tasks", "priority", {
        type: Sequelize.ENUM("low", "medium", "high"),
        allowNull: false,
        defaultValue: "medium",
      });
    }

    console.log(`PostgreSQL connected: ${process.env.DB_HOST || "localhost"}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export default sequelize;
