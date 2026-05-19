import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";

dotenv.config();

const ADMIN_DEFAULTS = {
  email: "master@admin.com",
  password: "MasterAdmin@2026",
  name: "Master Admin",
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("✓ Connected to PostgreSQL");

    const existingAdmin = await User.findOne({
      where: { email: ADMIN_DEFAULTS.email },
    });

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Name: ${existingAdmin.name}`);
    } else {
      const adminUser = await User.create({
        email: ADMIN_DEFAULTS.email,
        password: ADMIN_DEFAULTS.password,
        name: ADMIN_DEFAULTS.name,
        role: "admin",
        isAdmin: true,
      });

      console.log("✓ Admin user created successfully!");
      console.log(`  Email: ${adminUser.email}`);
      console.log(`  Password: ${ADMIN_DEFAULTS.password}`);
      console.log(`  Name: ${adminUser.name}`);
      console.log(`  Role: ${adminUser.role}`);
      console.log("\n⚠️  IMPORTANT: Change the default admin password after first login!");
    }

    console.log("\n✓ Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("✗ Seed failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
